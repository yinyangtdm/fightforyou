"use strict";

const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Nominatim requires a descriptive User-Agent
const USER_AGENT = "legal-directory-geocoder/1.0 (yinyangthetwin@gmail.com)";

// Nominatim ToS: max 1 request/second
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocode(listing) {
  const parts = [
    listing.streetAddress,
    listing.city,
    listing.state,
    listing.zipCode,
  ].filter(Boolean);

  if (parts.length === 0) return null;

  const q = encodeURIComponent(parts.join(", ") + ", USA");
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`;

  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${listing.name}`);

  const data = await res.json();
  if (!data.length) return null;

  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

async function main() {
  const listings = await prisma.listing.findMany({
    where: {
      latitude: null,
      OR: [
        { streetAddress: { not: null } },
        { city: { not: null } },
        { zipCode: { not: null } },
      ],
    },
    select: {
      id: true,
      name: true,
      streetAddress: true,
      city: true,
      state: true,
      zipCode: true,
    },
  });

  console.log(`Found ${listings.length} listings without coordinates.\n`);

  let updated = 0;
  let failed = 0;

  for (const listing of listings) {
    try {
      const coords = await geocode(listing);
      if (coords) {
        await prisma.listing.update({
          where: { id: listing.id },
          data: { latitude: coords.lat, longitude: coords.lng },
        });
        console.log(`  ✓ ${listing.name} → ${coords.lat}, ${coords.lng}`);
        updated++;
      } else {
        console.log(`  ✗ ${listing.name} — no result`);
        failed++;
      }
    } catch (err) {
      console.error(`  ! ${listing.name} — ${err.message}`);
      failed++;
    }

    await sleep(1100); // stay under Nominatim's 1 req/s limit
  }

  console.log(`\nDone. ${updated} geocoded, ${failed} failed/skipped.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
