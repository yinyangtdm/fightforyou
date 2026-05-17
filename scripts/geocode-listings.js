"use strict"

const path = require("path")
const { PrismaClient } = require("@prisma/client")
const { PrismaPg } = require("@prisma/adapter-pg")
require("dotenv").config({ path: path.join(__dirname, "..", ".env") })

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL_PROD, ssl: { rejectUnauthorized: false } }),
})

async function geocode(listing) {
  const params = new URLSearchParams({
    street: listing.streetAddress,
    city: listing.city || "",
    state: listing.state || "",
    zip: listing.zipCode || "",
    benchmark: "2020",
    format: "json",
  })
  const url = `https://geocoding.geo.census.gov/geocoder/locations/address?${params}`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  const matches = json?.result?.addressMatches
  if (!matches?.length) return null
  const { x: longitude, y: latitude } = matches[0].coordinates
  return { latitude, longitude }
}

async function main() {
  const listings = await prisma.listing.findMany({
    where: { streetAddress: { not: null }, latitude: null },
    select: { id: true, name: true, streetAddress: true, city: true, state: true, zipCode: true },
    orderBy: { id: "asc" },
  })
  console.log(`Found ${listings.length} listings to geocode\n`)

  let filled = 0
  let failed = 0

  for (const listing of listings) {
    process.stdout.write(`[#${listing.id}] ${listing.name} — `)
    try {
      const coords = await geocode(listing)
      if (!coords) {
        console.log("no match")
        failed++
      } else {
        await prisma.listing.update({
          where: { id: listing.id },
          data: { latitude: coords.latitude, longitude: coords.longitude },
        })
        console.log(`${coords.latitude}, ${coords.longitude}`)
        filled++
      }
    } catch (err) {
      console.log(`error: ${err.message}`)
      failed++
    }
    // Census geocoder asks for max ~1 req/sec
    await new Promise(r => setTimeout(r, 1100))
  }

  await prisma.$disconnect()
  console.log(`\nDone. ${filled} geocoded, ${failed} failed.`)
}

main().catch(err => { console.error(err); process.exit(1) })
