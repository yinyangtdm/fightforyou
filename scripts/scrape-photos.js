"use strict";

// Scrapes headshots / logos for listings that have no photoUrl.
// Strategy: website first, then Facebook.
// Run: node scripts/scrape-photos.js
// Dry run (no uploads/DB writes): node scripts/scrape-photos.js --dry-run
// Single listing: node scripts/scrape-photos.js --id 55

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { chromium } = require("playwright");
const { v2: cloudinary } = require("cloudinary");

const PROD_URL =
  "postgresql://postgres:MQSFLiQjrLvGYFnfAWegffwQpOlQJJJY@switchback.proxy.rlwy.net:31851/railway";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: PROD_URL }),
});

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DRY_RUN = process.argv.includes("--dry-run");
const ONLY_ID = (() => {
  const idx = process.argv.indexOf("--id");
  return idx !== -1 ? Number(process.argv[idx + 1]) : null;
})();

// ─── image scoring (runs inside browser context) ────────────────────────────
// NOTE: called via page.evaluate([fn, args]) — receives a single {personName, isFirm} arg

function scoreFirmLogo() {
  const badPath = (src) => {
    const p = (() => { try { return new URL(src).pathname.toLowerCase(); } catch { return src.toLowerCase(); } })();
    if (
      p.includes("mural") ||
      p.includes("background") ||
      p.includes("banner") ||
      p.includes("hero") ||
      p.includes("slider") ||
      p.includes("stock") ||
      p.includes("thumbnail") ||
      p.includes("screenshot") ||
      p.includes("headshot") ||
      // Third-party award / accreditation badges
      p.includes("superlawyer") ||
      p.includes("avvo") ||
      p.includes("martindale") ||
      p.includes("abta") ||
      p.includes("abota") ||
      p.includes("/aaj") ||
      p.includes("nadc") ||
      p.includes("bbb.") ||
      p.includes("google-review") ||
      p.includes("yelp") ||
      // Generic company logos that appear as client/partner badges
      p.includes("/ibm") ||
      p.includes("/microsoft") ||
      p.includes("/google.")
    ) return true;
    // Sentence-like filenames (5+ hyphen-words) are marketing graphics, not logos
    const basename = p.split("/").pop().replace(/\.[^.]+$/, "");
    if (basename.split("-").length >= 5) return true;
    // Camera export filenames are photos, not logos
    if (/[-_]edit[-_]?|[-_]scaled|-\d{4}x\d{4}|^img_|^dsc_|^[a-z0-9]{6,}-edit/i.test(basename)) return true;
    return false;
  };

  // Pass 1a: logo-link pattern — firm logos live in <a> that links to the homepage
  // (award badges link to external sites; the firm's own logo links back to /)
  const origin = window.location.origin;
  const headerAnchors = Array.from(
    document.querySelectorAll(
      "header a, nav a, [class*='logo'] a, a[class*='logo'], [id*='logo'] a"
    )
  );
  for (const a of headerAnchors) {
    const href = a.href || "";
    const isHomeLink =
      href === origin ||
      href === origin + "/" ||
      href === "/" ||
      (href.startsWith(origin) && new URL(href).pathname === "/");
    if (!isHomeLink) continue;
    const img = a.querySelector("img");
    if (!img || !img.src || img.src.startsWith("data:")) continue;
    if (badPath(img.src)) continue;
    const r = img.getBoundingClientRect();
    if (r.width > 20 && r.height > 8 && r.width < 700 && r.height < 250) {
      return [{ src: img.src, score: 55 }];
    }
  }

  // Pass 1b: any image in header/nav that looks logo-sized
  const headerSelectors = ["header", "nav", '[class*="header"]', '[class*="nav"]', '[id*="header"]'];
  for (const sel of headerSelectors) {
    const container = document.querySelector(sel);
    if (!container) continue;
    const imgs = Array.from(container.querySelectorAll("img"));
    for (const img of imgs) {
      if (!img.src || img.src.startsWith("data:")) continue;
      if (badPath(img.src)) continue;
      const r = img.getBoundingClientRect();
      if (r.width > 30 && r.height > 10 && r.width < 700 && r.height < 250) {
        return [{ src: img.src, score: 50 }];
      }
    }
  }

  // Pass 2: any image with "logo" explicitly in the URL path AND the firm name nearby
  const allImgs = Array.from(document.querySelectorAll("img"));
  for (const img of allImgs) {
    if (!img.src || img.src.startsWith("data:")) continue;
    const path = (() => { try { return new URL(img.src).pathname.toLowerCase(); } catch { return ""; } })();
    if (!path.includes("logo")) continue;
    if (badPath(img.src)) continue;
    const r = img.getBoundingClientRect();
    if (r.width > 30 && r.height > 10 && r.width < 700 && r.height < 250) {
      return [{ src: img.src, score: 40 }];
    }
  }

  return [];
}

function scoreHeadshots({ personName }) {
  const parts = personName.toLowerCase().split(/\s+/).filter((p) => p.length > 2);
  // Last name is the strongest identifier; first name is common so only use it in alt text
  const lastName = parts[parts.length - 1];
  const imgs = Array.from(document.querySelectorAll("img"));

  return imgs
    .map((img) => {
      if (!img.src || img.src.startsWith("data:")) return null;

      let score = 0;
      const urlPath = (() => { try { return new URL(img.src).pathname.toLowerCase(); } catch { return ""; } })();
      const alt = (img.alt || "").toLowerCase();
      const cls = (img.className || "").toLowerCase();
      const rect = img.getBoundingClientRect();
      const w = rect.width || 0;
      const h = rect.height || 0;

      // Name matching: last name in path is strong; any name part in alt is strong
      if (urlPath.includes(lastName)) score += 15;
      if (parts.some((p) => alt.includes(p))) score += 15;
      // First name in path: moderate signal — useful on bio pages; deliberately lower than last name
      const firstName = parts[0];
      if (firstName && firstName.length > 3 && urlPath.includes(firstName)) score += 8;

      // Headshot signals
      if (alt.includes("headshot") || alt.includes("profile") || alt.includes("attorney")) score += 8;

      // Portrait-like display size (must be visible and reasonably large)
      if (w >= 80 && h >= 80) score += 3;
      if (h >= w * 0.8 && h <= w * 2.0) score += 5; // portrait-ish
      if (w > 150 && w < 600 && h > 150) score += 4; // typical headshot size

      // Penalise logos
      if (alt.includes("logo") || cls.includes("logo") || urlPath.includes("logo")) score -= 20;
      if (alt.includes("background") || alt.includes("banner") || alt.includes("hero")) score -= 10;
      // Penalise video thumbnails / screenshots
      if (urlPath.includes("thumbnail") || urlPath.includes("screenshot") || urlPath.includes("video")) score -= 15;
      if (alt.includes("thumbnail") || alt.includes("screenshot") || alt.includes("video")) score -= 15;
      // Penalise invisible/tiny
      if (w < 60 || h < 60) score -= 10;
      // Penalise very wide images (banners)
      if (w > 0 && h > 0 && w / h > 3) score -= 10;

      return { src: img.src, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
}

// ─── website scraping ────────────────────────────────────────────────────────

async function tryWebsite(page, listing) {
  if (!listing.website) return null;

  const origin = (() => {
    try {
      return new URL(listing.website).origin;
    } catch {
      return null;
    }
  })();
  if (!origin) return null;

  try {
    await page.goto(listing.website, { waitUntil: "domcontentloaded", timeout: 18000 });
  } catch (e) {
    console.log(`    website load failed: ${e.message.slice(0, 80)}`);
    return null;
  }

  if (listing.isFirm) {
    return scrapeFromCurrentPage(page, listing);
  }

  // For individuals: try common bio URL patterns first
  const [first, ...rest] = listing.name.split(" ");
  const last = rest[rest.length - 1] || "";
  const slug = listing.slug;

  const fl = `${first.toLowerCase()}-${last.toLowerCase()}`;
  const bioPatterns = [
    `/attorneys/${slug}`,
    `/team/${slug}`,
    `/our-team/${slug}`,
    `/lawyers/${slug}`,
    `/people/${slug}`,
    `/about/${slug}`,
    `/attorneys/${fl}`,
    `/team/${fl}`,
    `/our-attorneys/${slug}`,
    `/our-attorneys/${fl}`,
    `/attorney/${slug}`,
    `/attorney/${fl}`,
    `/lawyer/${slug}`,
    `/lawyer/${fl}`,
    `/staff/${slug}`,
    `/meet-${first.toLowerCase()}`,
    `/meet-${first.toLowerCase()}.html`,
    `/${first.toLowerCase()}-${last.toLowerCase()}`,
    `/${slug}`,
  ];

  for (const pattern of bioPatterns) {
    try {
      const res = await page.goto(origin + pattern, {
        waitUntil: "domcontentloaded",
        timeout: 8000,
      });
      const landedUrl = page.url();
      const is404 = !res || !res.ok() || /\/(404|not.found|error)\b/i.test(landedUrl);
      if (is404) continue;
      const img = await scrapeFromCurrentPage(page, listing);
      if (img) return img;
    } catch {
      // try next
    }
  }

  // Try navigating to a team / attorneys index page
  try {
    await page.goto(listing.website, { waitUntil: "domcontentloaded", timeout: 12000 });
    const teamHref = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a[href]"));
      const kws = ["attorney", "lawyer", "team", "people", "staff", "about"];
      for (const kw of kws) {
        const a = links.find(
          (l) =>
            l.textContent.toLowerCase().includes(kw) &&
            !l.href.includes("#") &&
            !l.href.includes("mailto")
        );
        if (a) return a.href;
      }
      return null;
    });

    if (teamHref) {
      await page.goto(teamHref, { waitUntil: "domcontentloaded", timeout: 12000 });

      // Try clicking through to the individual's bio page
      // Prefer first+last match; fall back to last-name-only (verified by URL check below)
      const personHref = await page.evaluate((name) => {
        const parts = name.toLowerCase().split(/\s+/).filter((p) => p.length > 1);
        const firstName = parts[0];
        const lastName = parts[parts.length - 1];
        const links = Array.from(document.querySelectorAll("a[href]"));
        // Strict: both names
        let match = links.find((l) => {
          const text = l.textContent.toLowerCase();
          return text.includes(lastName) && text.includes(firstName);
        });
        // Fallback: last name only (URL will be verified below)
        if (!match) {
          match = links.find((l) => l.textContent.toLowerCase().includes(lastName));
        }
        return match ? match.href : null;
      }, listing.name);

      if (personHref) {
        try {
          await page.goto(personHref, { waitUntil: "domcontentloaded", timeout: 10000 });
          // Verify this page is about the right person — URL must contain their first name or slug
          const bioUrl = page.url().toLowerCase();
          const firstName = listing.name.split(/\s+/)[0].toLowerCase();
          const isRightPerson = bioUrl.includes(firstName) || bioUrl.includes(listing.slug);
          if (isRightPerson) {
            const img = await scrapeFromCurrentPage(page, listing);
            if (img) return img;
          } else {
            console.log(`    bio page rejected — URL doesn't match person: ${bioUrl.slice(0, 80)}`);
          }
        } catch {
          // fall through to team page scan
        }
      }

      // Scan the team index page itself
      return scrapeFromCurrentPage(page, listing);
    }
  } catch (e) {
    console.log(`    team page nav failed: ${e.message.slice(0, 80)}`);
  }

  return null;
}

async function scrapeFromCurrentPage(page, listing) {
  try {
    await page.waitForTimeout(800);
    const scored = listing.isFirm
      ? await page.evaluate(scoreFirmLogo)
      : await page.evaluate(scoreHeadshots, { personName: listing.name });
    const threshold = listing.isFirm ? 10 : 8;
    const best = scored.find((s) => s.score >= threshold);
    if (best) {
      console.log(`    page: ${page.url().slice(0, 90)}`);
      console.log(`    best score=${best.score} src=${best.src.slice(0, 100)}`);
    }
    return best ? best.src : null;
  } catch (e) {
    console.log(`    scrape error: ${e.message.slice(0, 80)}`);
    return null;
  }
}

// ─── Facebook scraping ───────────────────────────────────────────────────────

async function tryFacebook(page, listing) {
  if (!listing.facebook) return null;

  try {
    await page.goto(listing.facebook, { waitUntil: "domcontentloaded", timeout: 18000 });
    await page.waitForTimeout(2000); // let JS render

    const img = await page.evaluate(() => {
      const allImgs = Array.from(document.querySelectorAll("img"));
      // scontent URLs are user-uploaded FB media; rsrc.php is FB's own UI assets — skip those
      const userImgs = allImgs.filter((el) => {
        const src = el.src || "";
        return (
          src.includes("scontent") &&
          !src.includes("rsrc.php") &&
          !src.startsWith("data:")
        );
      });

      // Profile picture: squarish, reasonably sized scontent image near the top of the page
      for (const el of userImgs) {
        const w = el.naturalWidth || el.width || 0;
        const h = el.naturalHeight || el.height || 0;
        if (w >= 50 && h >= 50 && Math.abs(w - h) < w * 0.5) {
          return el.src;
        }
      }
      // Fallback: any user-uploaded image
      return userImgs.length ? userImgs[0].src : null;
    });

    return img;
  } catch (e) {
    console.log(`    Facebook failed: ${e.message.slice(0, 80)}`);
    return null;
  }
}

// ─── Cloudinary upload ───────────────────────────────────────────────────────

async function uploadToCloudinary(imageUrl, slug) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: slug,
      overwrite: true,
      invalidate: true,
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    });
    return result.secure_url;
  } catch (e) {
    console.log(`    Cloudinary upload failed: ${e.message.slice(0, 120)}`);
    return null;
  }
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  const where = ONLY_ID
    ? { id: ONLY_ID }
    : { OR: [{ photoUrl: null }, { photoUrl: "" }] };

  const listings = await prisma.listing.findMany({
    where,
    select: { id: true, name: true, slug: true, website: true, facebook: true, isFirm: true },
    orderBy: { name: "asc" },
  });

  console.log(`\n${listings.length} listing(s) to process${DRY_RUN ? " [DRY RUN]" : ""}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
  });

  const found = [];
  const notFound = [];

  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    console.log(`[${i + 1}/${listings.length}] ${listing.name} (${listing.isFirm ? "firm" : "individual"})`);

    const page = await context.newPage();
    let rawUrl = null;
    let source = null;

    // 1. Website
    if (listing.website) {
      console.log(`  → website: ${listing.website}`);
      rawUrl = await tryWebsite(page, listing);
      if (rawUrl) {
        source = "website";
        console.log(`  ✓ found on website`);
      }
    }

    // 2. Facebook
    if (!rawUrl && listing.facebook) {
      console.log(`  → facebook: ${listing.facebook}`);
      rawUrl = await tryFacebook(page, listing);
      if (rawUrl) {
        source = "facebook";
        console.log(`  ✓ found on facebook`);
      }
    }

    await page.close();

    if (rawUrl) {
      if (DRY_RUN) {
        console.log(`  [dry-run] would upload: ${rawUrl.slice(0, 100)}`);
        found.push({ name: listing.name, source, rawUrl });
      } else {
        const cloudUrl = await uploadToCloudinary(rawUrl, listing.slug);
        if (cloudUrl) {
          await prisma.listing.update({
            where: { id: listing.id },
            data: { photoUrl: cloudUrl },
          });
          console.log(`  ✓ saved: ${cloudUrl}`);
          found.push({ name: listing.name, source, url: cloudUrl });
        } else {
          notFound.push({ name: listing.name, reason: "cloudinary upload failed" });
        }
      }
    } else {
      console.log(`  ✗ no image found`);
      notFound.push({
        name: listing.name,
        website: listing.website,
        facebook: listing.facebook,
      });
    }

    // Brief pause between requests to be polite
    await new Promise((r) => setTimeout(r, 800));
  }

  await browser.close();
  await prisma.$disconnect();

  console.log("\n═══════════════════════════════════");
  console.log(`Found + uploaded : ${found.length}`);
  console.log(`Not found        : ${notFound.length}`);

  if (notFound.length) {
    console.log("\nStill need photos:");
    notFound.forEach((l) => console.log(`  • ${l.name}${l.reason ? " — " + l.reason : ""}`));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
