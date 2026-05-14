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

const LINKEDIN_SKIP = /linkedin\.com\/(shareArticle|sharing|feed|jobs|pulse|login|signup|uas)/i
const FACEBOOK_SKIP =
  /facebook\.com\/(sharer|share\.php|login|dialog|plugins|tr\b|photo|video|watch|events|groups|marketplace|gaming|ads)/i

function extractSocialLinks(html) {
  const hrefRe = /href=["']([^"']+)["']/gi
  let match
  let linkedin
  let facebook

  while ((match = hrefRe.exec(html)) !== null) {
    const href = match[1]
    if (!linkedin && /linkedin\.com\/(in|company)\//i.test(href) && !LINKEDIN_SKIP.test(href)) {
      linkedin = href.split("?")[0].replace(/\/$/, "")
      if (!linkedin.startsWith("http")) linkedin = `https://${linkedin.replace(/^\/\//, "")}`
    }
    if (!facebook && /facebook\.com\//i.test(href) && !FACEBOOK_SKIP.test(href)) {
      const clean = href.split("?")[0].replace(/\/$/, "")
      if (/facebook\.com\/[a-zA-Z0-9._-]{2,}/.test(clean)) {
        facebook = clean
        if (!facebook.startsWith("http")) facebook = `https://${facebook.replace(/^\/\//, "")}`
      }
    }
    if (linkedin && facebook) break
  }

  return { linkedin, facebook }
}

async function scrapeContactFromWebsite(websiteUrl) {
  const base = websiteUrl.replace(/\/$/, "")
  const pages = [base, `${base}/contact`, `${base}/contact-us`, `${base}/about`]
  const textChunks = []
  let linkedin
  let facebook

  for (const url of pages) {
    try {
      const { default: nodeFetch } = await import("node-fetch")
      const res = await nodeFetch(url, {
        signal: AbortSignal.timeout(6000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; LegalDirectory/1.0)" },
      })
      if (!res.ok) continue
      const html = await res.text()

      if (!linkedin || !facebook) {
        const found = extractSocialLinks(html)
        if (!linkedin && found.linkedin) linkedin = found.linkedin
        if (!facebook && found.facebook) facebook = found.facebook
      }

      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim()
      textChunks.push(text.slice(0, 3000))
    } catch {
      continue
    }
  }

  if (!textChunks.length) return { linkedin, facebook }

  const siteText = textChunks.join("\n\n---\n\n").slice(0, 8000)

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{
        role: "user",
        content: `Extract contact information from the following law firm website text. Return only a JSON object with these keys (omit any you cannot find with confidence):
- phone (string — main office phone number)
- email (string — main contact email)
- streetAddress (string)
- city (string)
- state (2-letter US state abbreviation)
- zipCode (string)

Return only valid JSON, no markdown, no explanation.

Website text:
${siteText}`,
      }],
    })

    const raw = msg.content[0].type === "text" ? msg.content[0].text : ""
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()
    const contact = JSON.parse(cleaned)
    return { ...contact, linkedin, facebook }
  } catch {
    return { linkedin, facebook }
  }
}

async function autofillListing(name) {
  const prompt = `Using your knowledge, research the civil rights attorney or law firm named "${name}" and fill out the following fields for a legal directory focused on police misconduct and civil rights cases:

- name: Full official firm or attorney name
- firm: Law firm name (if individual attorney)
- isFirm: true if this is a law firm, false if individual attorney
- isNonprofit: true if nonprofit legal organization
- isNational: true if they serve clients nationwide
- tagline: A 3-6 word descriptive nickname-style tagline (e.g. "The National Police Accountability Firm")
- email: Email address — check firm website, contact pages, bar association listings
- phone: Main office phone number
- description: 3-4 paragraph bio focusing on history against police and government entities. Authoritative tone. Separate paragraphs with \\n\\n.
- streetAddress / city / state / zipCode: Office address
- specialties: Practice areas limited strictly to civil rights, police misconduct, wrongful death, wrongful conviction, excessive force, false arrest
- notableResults: 7-figure settlements and verdicts against police or government
- keyCharacteristics: Full descriptive sentences — e.g. "Represented over 300 families in wrongful death cases against law enforcement" not just "Wrongful death experience". Do NOT include bar number here.
- barNumber: State bar admission number
- website: Full website URL including https://
- linkedin: Full LinkedIn URL. Search for the name plus "LinkedIn". linkedin.com/in/firstname-lastname or linkedin.com/company/firm-name
- facebook: Full Facebook URL. Search for the name plus "Facebook". facebook.com/FirmName or facebook.com/firstname.lastname

Return only a JSON object with these exact keys (omit keys where no information is found). No markdown, no explanation.`

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  })

  const raw = message.content[0].type === "text" ? message.content[0].text : ""
  const parsed = JSON.parse(extractFirstJson(raw))

  if (parsed.website) {
    const scraped = await scrapeContactFromWebsite(parsed.website)
    if (scraped.phone) parsed.phone = scraped.phone
    if (scraped.email) parsed.email = scraped.email
    if (scraped.streetAddress) parsed.streetAddress = scraped.streetAddress
    if (scraped.city) parsed.city = scraped.city
    if (scraped.state) parsed.state = scraped.state
    if (scraped.zipCode) parsed.zipCode = scraped.zipCode
    if (scraped.linkedin) parsed.linkedin = scraped.linkedin
    if (scraped.facebook) parsed.facebook = scraped.facebook
  }

  return parsed
}

function extractFirstJson(text) {
  const start = text.indexOf("{")
  if (start === -1) throw new Error("No JSON object found in response")
  let depth = 0
  let inString = false
  let escape = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (escape) { escape = false; continue }
    if (ch === "\\" && inString) { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (!inString) {
      if (ch === "{") depth++
      else if (ch === "}") { depth--; if (depth === 0) return text.slice(start, i + 1) }
    }
  }
  throw new Error("Unterminated JSON object in response")
}

function toStringArray(val) {
  if (!val) return undefined
  if (Array.isArray(val)) return val.filter(Boolean)
  return undefined
}

async function main() {
  const listings = await prisma.listing.findMany({
    where: { id: { gte: 4, lte: 107 } },
    orderBy: { id: "asc" },
  })
  console.log(`Found ${listings.length} listing(s)\n`)

  for (const listing of listings) {
    console.log(`[#${listing.id}] ${listing.name} — filling...`)
    try {
      const data = await autofillListing(listing.name)

      const update = {
        ...(data.firm !== undefined && { firm: data.firm }),
        ...(data.isFirm !== undefined && { isFirm: !!data.isFirm }),
        ...(data.isNonprofit !== undefined && { isNonprofit: !!data.isNonprofit }),
        ...(data.isNational !== undefined && { isNational: !!data.isNational }),
        ...(data.tagline && { tagline: data.tagline }),
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.description && { description: data.description }),
        ...(data.streetAddress && { streetAddress: data.streetAddress }),
        ...(data.city && { city: data.city }),
        ...(data.state && { state: data.state }),
        ...(data.zipCode && { zipCode: data.zipCode }),
        ...(toStringArray(data.specialties) && { specialties: toStringArray(data.specialties) }),
        ...(toStringArray(data.notableResults) && { notableResults: toStringArray(data.notableResults) }),
        ...(toStringArray(data.keyCharacteristics) && { keyCharacteristics: toStringArray(data.keyCharacteristics) }),
        ...(data.barNumber && { barNumber: data.barNumber }),
        ...(data.website && { website: data.website }),
        ...(data.linkedin && { linkedin: data.linkedin }),
        ...(data.facebook && { facebook: data.facebook }),
      }

      await prisma.listing.update({ where: { id: listing.id }, data: update })
      console.log(`  ✓ saved — ${Object.keys(update).join(", ")}`)
    } catch (err) {
      console.error(`  ✗ failed: ${err.message}`)
    }

    // Brief pause between requests to avoid rate limits
    await new Promise(r => setTimeout(r, 1500))
  }

  await prisma.$disconnect()
  console.log("\nDone.")
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
