"use strict"

const path = require("path")
const { PrismaClient } = require("@prisma/client")
const { PrismaPg } = require("@prisma/adapter-pg")
const Anthropic = require("@anthropic-ai/sdk").default
require("dotenv").config({ path: path.join(__dirname, "..", ".env") })

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function extractFirstJson(text) {
  const start = text.indexOf("{")
  if (start === -1) throw new Error("No JSON object found")
  let depth = 0, inStr = false, esc = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (esc) { esc = false; continue }
    if (ch === "\\" && inStr) { esc = true; continue }
    if (ch === '"') { inStr = !inStr; continue }
    if (!inStr) {
      if (ch === "{") depth++
      else if (ch === "}") { depth--; if (depth === 0) return text.slice(start, i + 1) }
    }
  }
  throw new Error("Unterminated JSON object")
}

async function lookupAddress(name, website) {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [{
      role: "user",
      content: `Look up the office address for the law firm or attorney named "${name}"${website ? ` (website: ${website})` : ""}. Return only a JSON object with these keys (omit any you cannot find with confidence):
- streetAddress (string — street number and name, e.g. "123 Main St Suite 400")
- city (string)
- state (2-letter US state abbreviation)
- zipCode (string)

Return only valid JSON, no markdown, no explanation.`,
    }],
  })

  const raw = msg.content[0].type === "text" ? msg.content[0].text : ""
  return JSON.parse(extractFirstJson(raw))
}

async function main() {
  const listings = await prisma.listing.findMany({
    where: { streetAddress: null },
    select: { id: true, name: true, website: true, city: true, state: true },
    orderBy: { id: "asc" },
  })
  console.log(`Found ${listings.length} listings without street address\n`)

  let filled = 0

  for (const listing of listings) {
    console.log(`[#${listing.id}] ${listing.name} — looking up address...`)
    try {
      const addr = await lookupAddress(listing.name, listing.website)

      if (!addr.streetAddress) {
        console.log("  — no address found")
        continue
      }

      const update = {
        streetAddress: addr.streetAddress,
        ...(!listing.city && addr.city && { city: addr.city }),
        ...(!listing.state && addr.state && { state: addr.state }),
        ...(addr.zipCode && { zipCode: addr.zipCode }),
      }

      await prisma.listing.update({ where: { id: listing.id }, data: update })
      console.log(`  ✓ ${addr.streetAddress}, ${addr.city || listing.city} ${addr.state || listing.state} ${addr.zipCode || ""}`.trim())
      filled++
    } catch (err) {
      console.error(`  ✗ error: ${err.message}`)
    }

    await new Promise(r => setTimeout(r, 1000))
  }

  await prisma.$disconnect()
  console.log(`\nDone. ${filled} listing(s) updated.`)
}

main().catch(err => { console.error(err); process.exit(1) })
