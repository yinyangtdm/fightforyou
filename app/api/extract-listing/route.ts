import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const FIELDS_PROMPT = `Return only a JSON object with these exact keys (omit keys where no information is found):
- name (string)
- firm (string)
- isFirm (boolean — true if the listing is itself a law firm rather than an individual)
- isNonprofit (boolean)
- tagline (string — short memorable nickname-like description, ideally 3-5 words, that captures the essence of the lawyer or firm and uniquely distinguishes them from the others in the database; for example, "The Top Personal Injury Lawyer" or "Award-Winning Civil Rights Firm")
- email (string)
- phone (string)
- description (string — full multi-paragraph bio, authoritative tone; separate paragraphs with \\n\\n so the JSON stays valid)
- streetAddress (string)
- city (string)
- state (2-letter US state abbreviation)
- zipCode (string)
- isNational (boolean — true if the lawyer or firm serves clients nationwide rather than a specific state or region)
- specialties (array of strings — practice area names, limited to civil rights, police misconduct, wrongful death, wrongful conviction, and other police-related fields)
- notableResults (array of strings — case results, verdicts, settlements, especially 7-figure results against police or government)
- keyCharacteristics (array of strings — each entry should be a full descriptive sentence or phrase, not a short label; include traits, languages, awards, credentials, and distinguishing qualities with context; e.g. "Secured over $50M in settlements against law enforcement" not just "High settlements" — do NOT include bar numbers here)
- barNumber (string — bar admission number, do NOT include this in keyCharacteristics)
- website (string — full URL including https://)
- linkedin (string — full LinkedIn profile or company URL; for individuals linkedin.com/in/firstname-lastname, for firms linkedin.com/company/firm-name; search the name if not stated in the bio)
- facebook (string — full Facebook page URL; typically facebook.com/FirmName or facebook.com/firstname.lastname; search the name if not stated in the bio)

Return only valid JSON, no markdown, no explanation.`

export async function POST(req: Request) {
  try {
    const body = await req.json() as { text?: string; name?: string }

    let prompt: string

    if (body.name?.trim()) {
      prompt = `Using your knowledge, research the civil rights attorney or law firm named "${body.name}" and fill out the following fields for a legal directory focused on police misconduct and civil rights cases:

- name: Full official firm or attorney name
- tagline: A 3-6 word descriptive nickname-style tagline that captures the essence of the lawyer or firm (e.g. "The National Police Accountability Firm")
- email: Email address — check the firm website contact page, attorney profile pages, and bar association listings. Try searching "[name] [firm] email contact" if not immediately obvious.
- phone: Phone number
- description: 3-4 paragraph bio focusing specifically on their history taking on police and government entities — their track record, notable cases, approach, and reputation. Authoritative tone. Separate paragraphs with \\n\\n.
- streetAddress / city / state / zipCode: Office address
- specialties: Practice areas limited strictly to civil rights, police misconduct, wrongful death, wrongful conviction, excessive force, false arrest, and other police-related fields only
- notableResults: Notable case results — specifically 7-figure settlements and verdicts against police or government entities
- keyCharacteristics: Key traits, credentials, awards, languages, and distinguishing qualities — each entry should be a full descriptive sentence or phrase, not just a label. For example: "One of fewer than 50 attorneys in the country board-certified in civil rights law" rather than "Board certified". Or "Represented over 300 families in wrongful death cases against law enforcement" rather than "Wrongful death experience". Do NOT include bar number here.
- barNumber: State bar admission number
- website: Full website URL — include https://
- linkedin: Full LinkedIn profile URL. This is required — do your best to find it. For individual attorneys the URL follows linkedin.com/in/firstname-lastname (e.g. linkedin.com/in/john-doe-attorney). For firms it follows linkedin.com/company/firm-name. To find it: (1) search "[full name] [firm name] LinkedIn attorney", (2) try linkedin.com/in/ variations of their name, (3) check if the firm website lists a LinkedIn link. Only omit if truly not findable after exhausting these approaches.
- facebook: Full Facebook page URL. This is required — do your best to find it. Firm pages typically follow facebook.com/FirmName or facebook.com/FirmNameLaw. Individual attorneys may use facebook.com/firstname.lastname or facebook.com/attorneyfirstnamelastname. To find it: (1) search "[full name] [firm name] Facebook attorney", (2) try facebook.com/ variations of their name or firm name, (3) check if the firm website or LinkedIn lists a Facebook link. Only omit if truly not findable after exhausting these approaches.
- isFirm: true if this is a law firm, false if individual attorney
- isNonprofit: true if nonprofit legal organization
- isNational: true if they serve clients nationwide

${FIELDS_PROMPT}`
    } else if (body.text?.trim()) {
      prompt = `Extract lawyer/firm listing fields from the following bio text.

${FIELDS_PROMPT}

Bio text:
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
      return NextResponse.json(JSON.parse(cleaned))
    } catch {
      return NextResponse.json({ error: "Failed to parse response", raw }, { status: 500 })
    }
  } catch (error) {
    console.error("Extract listing error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
