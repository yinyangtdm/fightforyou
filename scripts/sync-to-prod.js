"use strict"

// Syncs listings from local dev DB → Railway prod DB.
// Upserts on slug — new listings are created, existing ones are updated only
// if any field has changed. Prod-only listings are never touched.
//
// Usage:
//   node scripts/sync-to-prod.js            # live run
//   node scripts/sync-to-prod.js --dry-run  # preview only, no writes

const path = require("path")
require("dotenv").config({ path: path.join(__dirname, "..", ".env") })

const { PrismaClient } = require("@prisma/client")
const { PrismaPg } = require("@prisma/adapter-pg")

const DRY_RUN = process.argv.includes("--dry-run")

const PROD_URL = process.env.DATABASE_URL_PROD
if (!PROD_URL) {
  console.error("ERROR: DATABASE_URL_PROD is not set in .env")
  process.exit(1)
}

const local = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

const prod = new PrismaClient({
  adapter: new PrismaPg({ connectionString: PROD_URL, ssl: { rejectUnauthorized: false } }),
})

// Fields to compare/sync (excludes id, createdAt, updatedAt)
const FIELDS = [
  "isFirm", "isNonprofit", "name", "slug", "email", "phone", "photoUrl",
  "firm", "tagline", "description", "streetAddress", "city", "state",
  "zipCode", "isNational", "latitude", "longitude", "specialties",
  "notableResults", "keyCharacteristics", "barNumber", "website",
  "linkedin", "facebook", "approved", "featured",
]

function serialize(val) {
  if (Array.isArray(val)) return JSON.stringify([...val].sort())
  if (val === null || val === undefined) return ""
  return String(val)
}

function diff(local, prod) {
  return FIELDS.filter(f => serialize(local[f]) !== serialize(prod[f]))
}

function pick(obj) {
  return Object.fromEntries(FIELDS.map(f => [f, obj[f]]))
}

async function main() {
  console.log(DRY_RUN ? "DRY RUN — no writes will happen\n" : "LIVE RUN\n")

  const [localListings, prodListings] = await Promise.all([
    local.listing.findMany({ orderBy: { name: "asc" } }),
    prod.listing.findMany({ select: { slug: true, id: true, ...Object.fromEntries(FIELDS.map(f => [f, true])) } }),
  ])

  const prodBySlug = new Map(prodListings.map(l => [l.slug, l]))

  let created = 0, updated = 0, skipped = 0

  for (const listing of localListings) {
    const existing = prodBySlug.get(listing.slug)

    if (!existing) {
      console.log(`  + CREATE  ${listing.slug}`)
      if (!DRY_RUN) {
        await prod.listing.create({ data: pick(listing) })
      }
      created++
    } else {
      const changed = diff(listing, existing)
      if (changed.length === 0) {
        skipped++
      } else {
        console.log(`  ~ UPDATE  ${listing.slug}  (changed: ${changed.join(", ")})`)
        if (!DRY_RUN) {
          await prod.listing.update({
            where: { slug: listing.slug },
            data: pick(listing),
          })
        }
        updated++
      }
    }
  }

  console.log(`\nDone.  created=${created}  updated=${updated}  skipped=${skipped}`)
  console.log(`(${prodListings.length - prodBySlug.size + localListings.length} prod-only listings were not touched)`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => {
    await local.$disconnect()
    await prod.$disconnect()
  })
