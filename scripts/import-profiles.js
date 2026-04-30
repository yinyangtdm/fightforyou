"use strict";

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Parse a PostgreSQL array literal like {"item one","item two",unquoted} into a JS string array.
// Handles quoted items, unquoted items, escaped quotes (\"), and escaped backslashes (\\).
function parsePgArray(value) {
  if (!value || value === "{}" || value === "\\N") return [];
  if (!value.startsWith("{")) return [];

  const inner = value.slice(1, -1);
  if (!inner) return [];

  const result = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < inner.length) {
    const ch = inner[i];
    if (ch === "\\" && inQuotes) {
      const next = inner[i + 1];
      if (next === '"')  { current += '"';  i += 2; continue; }
      if (next === "\\") { current += "\\"; i += 2; continue; }
    }
    if (ch === '"' && !inQuotes) { inQuotes = true;  i++; continue; }
    if (ch === '"' &&  inQuotes) { inQuotes = false; i++; continue; }
    if (ch === "," && !inQuotes) { result.push(current); current = ""; i++; continue; }
    current += ch;
    i++;
  }
  result.push(current);

  return result.map((s) => s.trim()).filter(Boolean);
}

function nullOrString(v) {
  return v === "\\N" || v === "" ? null : v;
}

function parseBool(v) {
  return v === "t";
}

async function main() {
  const sqlPath = path.join(__dirname, "..", "profiles.sql");
  if (!fs.existsSync(sqlPath)) {
    console.error("profiles.sql not found at project root");
    process.exit(1);
  }

  const lines = fs.readFileSync(sqlPath, "utf8").split("\n");

  // Locate the COPY block
  let copyLineIndex = -1;
  let columns = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("COPY public.profiles (")) {
      const m = lines[i].match(/COPY public\.profiles \(([^)]+)\)/);
      if (m) columns = m[1].split(",").map((c) => c.trim());
      copyLineIndex = i + 1;
      break;
    }
  }

  if (copyLineIndex === -1) {
    console.error("Could not find COPY block in profiles.sql");
    process.exit(1);
  }

  // Collect rows until the end-of-copy marker \.
  const dataLines = [];
  for (let i = copyLineIndex; i < lines.length; i++) {
    if (lines[i].trimEnd() === "\\.") break;
    if (lines[i].trim() === "") continue;
    dataLines.push(lines[i]);
  }

  console.log(`Columns : ${columns.join(", ")}`);
  console.log(`Rows    : ${dataLines.length}`);

  // Pre-fetch existing slugs to avoid duplicates
  const existing = await prisma.listing.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existing.map((l) => l.slug));
  console.log(`Existing: ${existingSlugs.size} listings already in database\n`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const line of dataLines) {
    const fields = line.split("\t");
    const row = {};
    columns.forEach((col, i) => { row[col] = fields[i] ?? "\\N"; });

    const slug = nullOrString(row.slug);
    if (!slug) {
      console.log(`  SKIP  (no slug) — ${row.name}`);
      skipped++;
      continue;
    }

    if (existingSlugs.has(slug)) {
      console.log(`  SKIP  ${row.name} (${slug}) — already exists`);
      skipped++;
      continue;
    }

    try {
      await prisma.listing.create({
        data: {
          name:               row.name,
          slug,
          firm:               nullOrString(row.firm),
          state:              row.state,
          city:               nullOrString(row.city),
          tagline:            nullOrString(row.tagline),
          description:        nullOrString(row.description),
          specialties:        parsePgArray(row.specialties),
          keyCharacteristics: parsePgArray(row.key_characteristics),
          notableResults:     parsePgArray(row.notable_results),
          website:            nullOrString(row.website),
          isNational:         parseBool(row.is_national),
          phone:              nullOrString(row.phone),
          email:              nullOrString(row.email),
          isFirm:             parseBool(row.is_firm),
          approved:           true,
          featured:           false,
        },
      });
      console.log(`  OK    ${row.name} (${slug})`);
      imported++;
    } catch (err) {
      console.error(`  ERR   ${row.name} (${slug}): ${err.message}`);
      errors++;
    }
  }

  console.log(`\nDone — imported: ${imported}, skipped: ${skipped}, errors: ${errors}`);
}

main()
  .catch((err) => { console.error("Fatal:", err); process.exit(1); })
  .finally(() => prisma.$disconnect());
