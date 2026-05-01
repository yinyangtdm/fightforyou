"use strict";

const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const STATE_ABBREVIATIONS = {
  "Alabama": "AL",
  "Alaska": "AK",
  "Arizona": "AZ",
  "Arkansas": "AR",
  "California": "CA",
  "Colorado": "CO",
  "Connecticut": "CT",
  "Delaware": "DE",
  "Florida": "FL",
  "Georgia": "GA",
  "Hawaii": "HI",
  "Idaho": "ID",
  "Illinois": "IL",
  "Indiana": "IN",
  "Iowa": "IA",
  "Kansas": "KS",
  "Kentucky": "KY",
  "Louisiana": "LA",
  "Maine": "ME",
  "Maryland": "MD",
  "Massachusetts": "MA",
  "Michigan": "MI",
  "Minnesota": "MN",
  "Mississippi": "MS",
  "Missouri": "MO",
  "Montana": "MT",
  "Nebraska": "NE",
  "Nevada": "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  "Ohio": "OH",
  "Oklahoma": "OK",
  "Oregon": "OR",
  "Pennsylvania": "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  "Tennessee": "TN",
  "Texas": "TX",
  "Utah": "UT",
  "Vermont": "VT",
  "Virginia": "VA",
  "Washington": "WA",
  "West Virginia": "WV",
  "Wisconsin": "WI",
  "Wyoming": "WY",
};

// Build a lowercase lookup for case-insensitive matching
const STATE_ABBR_LOWER = Object.fromEntries(
  Object.entries(STATE_ABBREVIATIONS).map(([k, v]) => [k.toLowerCase(), v])
);

async function main() {
  const listings = await prisma.listing.findMany({
    where: { state: { not: null } },
    select: { id: true, name: true, state: true },
  });

  let updated = 0;
  let skipped = 0;

  for (const listing of listings) {
    const state = listing.state;
    const abbr =
      STATE_ABBREVIATIONS[state] ??
      STATE_ABBR_LOWER[state.toLowerCase()] ??
      null;

    if (abbr && abbr !== state) {
      await prisma.listing.update({
        where: { id: listing.id },
        data: { state: abbr },
      });
      console.log(`  ${listing.name}: "${state}" → "${abbr}"`);
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`\nDone. ${updated} updated, ${skipped} skipped (already abbreviated or unrecognised).`);
}

main()
  .catch(err => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
