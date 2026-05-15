import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const FIELDS_PROMPT = `Return only a JSON object with these exact keys (omit keys where no information is found):
- name (string)
- firm (string)
- tagline (string — short memorable nickname-style description, ideally 3–6 words, that captures the essence of the lawyer or firm and uniquely distinguishes them; e.g. "The National Police Accountability Firm" or "Chicago's Relentless Civil Rights Advocate")
- email (string)
- phone (string)
- description (string — ORIGINAL 3–5 paragraph bio, authoritative tone, focusing on their history taking on police and government entities — track record, notable cases, approach, reputation. Do NOT copy sentences from source material. Separate paragraphs with \\n\\n so the JSON stays valid.)
- streetAddress (string — ONLY include if explicitly stated in the source material; do NOT guess or infer)
- city (string — ONLY include if explicitly stated in the source material; do NOT guess or infer)
- state (2-letter US state abbreviation — ONLY include if explicitly stated in the source material; do NOT guess or infer)
- zipCode (string — ONLY include if explicitly stated in the source material; do NOT guess)
- specialties (array of strings — practice area names STRICTLY limited to civil rights, police misconduct, wrongful death, wrongful conviction, excessive force, false arrest, and other police-related fields only)
- notableResults (array of strings — case results, verdicts, settlements; especially 7-figure results against police or government; include dollar amounts and context)
- keyCharacteristics (array of strings — each entry MUST be a full descriptive sentence or phrase, NOT a short label; include traits, languages, awards, credentials, and distinguishing qualities with context; e.g. "Secured over $50M in settlements against law enforcement" not "High settlements" — do NOT include bar number here)
- barNumber (string — bar admission number; do NOT include in keyCharacteristics)
- website (string — full URL including https://)
- linkedin (string — find the attorney's personal profile (linkedin.com/in/...) or fall back to the firm's company page (linkedin.com/company/...); use name-based URL patterns and training knowledge to generate your best candidate; the URL will be verified before use so include your best guess — but a URL that comes back 404 is worse than nothing)
- facebook (string — find the attorney's personal profile or fall back to the firm's page; use name-based URL patterns and training knowledge to generate your best candidate; the URL will be verified before use so include your best guess — but a URL that comes back 404 is worse than nothing)

Return only valid JSON, no markdown, no explanation.`

type ContactFields = {
  phone?: string
  email?: string
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
  linkedin?: string
  facebook?: string
}

type AddressFields = {
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
}

function splitAddressString(s: string): AddressFields | null {
  s = s.trim()
  // "street, city, ST zip"
  const a = s.match(/^(.+),\s*(.+),\s*([A-Za-z]{2})\s+(\d{5}(-\d{4})?)$/)
  if (a) return { streetAddress: a[1].trim(), city: a[2].trim(), state: a[3].toUpperCase(), zipCode: a[4] }
  // "street, city ST zip" (no comma before state)
  const b = s.match(/^(.+),\s*(.+?)\s+([A-Za-z]{2})\s+(\d{5}(-\d{4})?)$/)
  if (b) return { streetAddress: b[1].trim(), city: b[2].trim(), state: b[3].toUpperCase(), zipCode: b[4] }
  // "street city, ST, zip"
  const z = s.match(/^(.+)\s+([^,]+),\s*([A-Za-z]{2}),\s*(\d{5}(-\d{4})?)$/)
  if (z) return { streetAddress: z[1].trim(), city: z[2].trim(), state: z[3].toUpperCase(), zipCode: z[4] }
  return null
}

async function lookupByZip(zip: string): Promise<{ city: string; state: string } | null> {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) return null
    const data = await res.json() as { places?: Array<{ "place name": string; "state abbreviation": string }> }
    const place = data.places?.[0]
    if (!place) return null
    return { city: place["place name"], state: place["state abbreviation"] }
  } catch {
    return null
  }
}

async function normalizeAddress(fields: AddressFields): Promise<AddressFields> {
  // If streetAddress looks like a full combined string Claude didn't split, parse it now
  if (fields.streetAddress && !fields.zipCode) {
    const parsed = splitAddressString(fields.streetAddress)
    if (parsed) fields = { ...fields, ...parsed }
  }
  // Validate and correct city/state from zip — zippopotam.us is authoritative for US zips
  if (fields.zipCode) {
    const zip = fields.zipCode.slice(0, 5)
    if (/^\d{5}$/.test(zip)) {
      const result = await lookupByZip(zip)
      if (result) fields = { ...fields, city: result.city, state: result.state }
    }
  }
  return fields
}

async function verifyUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    })
    return res.status !== 404
  } catch {
    return true
  }
}

const LINKEDIN_SKIP = /linkedin\.com\/(shareArticle|sharing|feed|jobs|pulse|login|signup|uas)/i
const FACEBOOK_SKIP =
  /facebook\.com\/(sharer|share\.php|login|dialog|plugins|tr\b|photo|video|watch|events|groups|marketplace|gaming|ads)/i

function extractSocialLinks(html: string): { linkedin?: string; facebook?: string } {
  const hrefRe = /href=["']([^"']+)["']/gi
  let match
  let linkedin: string | undefined
  let facebook: string | undefined

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

async function scrapeContactFromWebsite(websiteUrl: string): Promise<ContactFields> {
  const base = websiteUrl.replace(/\/$/, "")
  const pages = [base, `${base}/contact`, `${base}/contact-us`, `${base}/about`]
  const textChunks: string[] = []
  let linkedin: string | undefined
  let facebook: string | undefined

  for (const url of pages) {
    try {
      const res = await fetch(url, {
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
    const contact = JSON.parse(cleaned) as ContactFields
    return { ...contact, linkedin, facebook }
  } catch {
    return { linkedin, facebook }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as { text?: string; name?: string; firm?: string }

    let prompt: string
    let htmlSocial: { linkedin?: string; facebook?: string } = {}

    if (body.text?.trim() && (body.name?.trim() || body.firm?.trim())) {
      // HTML pasted + name/firm already known — primary workflow
      const entityLabel = body.name && body.firm
        ? `attorney "${body.name}" at "${body.firm}"`
        : body.firm ? `law firm "${body.firm}"` : `attorney "${body.name}"`

      const stripped = body.text
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim()
        .slice(0, 10000)

      htmlSocial = extractSocialLinks(body.text)

      prompt = `You are building a listing for a civil rights legal directory focused on police misconduct cases. The entity is: ${entityLabel}.

Use the website text below as your primary source. Also draw on everything you know about this attorney or firm from your training data to add depth, context, and notable results that may not appear on the website.

${FIELDS_PROMPT}

Website text:
${stripped}`

    } else if (body.name?.trim()) {
      // Name only — look up from training data
      const entityLabel = body.firm
        ? `attorney "${body.name}" at "${body.firm}"`
        : `"${body.name}"`

      prompt = `You are building a listing for a civil rights legal directory focused on police misconduct cases. Using your training knowledge, research the attorney or law firm ${entityLabel} and fill out all the fields you can.

${FIELDS_PROMPT}`

    } else if (body.text?.trim()) {
      // Plain text pasted — no name known
      prompt = `You are building a listing for a civil rights legal directory focused on police misconduct cases. The user has provided source text about a lawyer or law firm. Extract all structured data from it and fill out the fields below. For address fields, ONLY include values explicitly stated in the source — do NOT guess or infer. Also draw on your training knowledge if you recognize the attorney or firm.

${FIELDS_PROMPT}

Source text:
${body.text}`

    } else {
      return NextResponse.json({ error: "No text or name provided" }, { status: 400 })
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    })

    const raw = message.content[0].type === "text" ? message.content[0].text : ""
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()
    try {
      const parsed = JSON.parse(cleaned)
      // Social links extracted directly from pasted HTML take precedence over Claude's output
      if (htmlSocial.linkedin) parsed.linkedin = htmlSocial.linkedin
      if (htmlSocial.facebook) parsed.facebook = htmlSocial.facebook
      // Scrape contact/social from other pages of the website if a URL was found
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
      const addr = await normalizeAddress({
        streetAddress: parsed.streetAddress,
        city: parsed.city,
        state: parsed.state,
        zipCode: parsed.zipCode,
      })
      parsed.streetAddress = addr.streetAddress
      parsed.city = addr.city
      parsed.state = addr.state
      parsed.zipCode = addr.zipCode
      // Verify social URLs — discard anything that 404s
      if (parsed.linkedin && !(await verifyUrl(parsed.linkedin))) delete parsed.linkedin
      if (parsed.facebook && !(await verifyUrl(parsed.facebook))) delete parsed.facebook
      return NextResponse.json(parsed)
    } catch {
      return NextResponse.json({ error: "Failed to parse response", raw }, { status: 500 })
    }
  } catch (error) {
    console.error("Extract listing error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
