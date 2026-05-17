import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function scrapeWebsiteText(websiteUrl: string): Promise<string> {
  const base = websiteUrl.replace(/\/$/, "")
  const pages = [base, `${base}/contact`, `${base}/contact-us`, `${base}/about`]
  const chunks: string[] = []
  for (const url of pages) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(6000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; LegalDirectory/1.0)" },
      })
      if (!res.ok) continue
      const html = await res.text()
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim()
      chunks.push(text.slice(0, 3000))
    } catch {
      continue
    }
  }
  return chunks.join("\n\n---\n\n").slice(0, 8000)
}

// Returns false only on an explicit 404 — network errors or redirects (e.g. LinkedIn login wall) are treated as "possibly real"
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

export async function POST(req: Request) {
  try {
    const { field, name, firm, website } = await req.json() as {
      field: string
      name?: string
      firm?: string
      website?: string
    }

    const entityLabel = name && firm
      ? `attorney "${name}" at "${firm}"`
      : firm ? `law firm "${firm}"` : name ? `"${name}"` : "this attorney or firm"

    let siteText = ""
    if (website) siteText = await scrapeWebsiteText(website)
    const siteContext = siteText ? `\n\nWebsite text:\n${siteText}` : ""

    let prompt: string
    let isArray = false
    let isObject = false

    switch (field) {
      case "tagline":
        prompt = `Generate a short 3–6 word descriptive nickname-style tagline for ${entityLabel} for a civil rights legal directory focused on police misconduct. Capture their essence and uniquely distinguish them. Examples: "The National Police Accountability Firm", "Chicago's Relentless Civil Rights Advocate". Return only the tagline text, no quotes, no explanation.${siteContext}`
        break

      case "description":
        prompt = `Write an original 3–5 paragraph bio for ${entityLabel} for a civil rights legal directory. Focus on their history taking on police and government entities — track record, notable cases, approach, reputation. Authoritative tone. Draw on your training knowledge and any website text provided, but do NOT fabricate specific case results, dollar amounts, settlements, or verdicts — only include specifics you are confident are true. Separate paragraphs with \\n\\n. Return only the bio text, no explanation.${siteContext}`
        break

      case "specialties":
        isArray = true
        prompt = `List the practice areas for ${entityLabel} relevant to a civil rights legal directory. STRICTLY limit to: civil rights, police misconduct, wrongful death, wrongful conviction, excessive force, false arrest, and other police-related fields only. Return a JSON array of strings, no markdown, no explanation.${siteContext}`
        break

      case "notableResults":
        isArray = true
        prompt = `List notable case results for ${entityLabel} found ONLY in the website text below — specifically settlements and verdicts against police or government entities. Include dollar amounts and context. Do NOT use training data — if no results are stated in the website text, return []. Return a JSON array of strings, no markdown, no explanation.${siteContext}`
        break

      case "keyCharacteristics":
        isArray = true
        prompt = `List key traits, credentials, awards, languages, and distinguishing qualities for ${entityLabel}. Each entry MUST be a full descriptive sentence or phrase, NOT a short label. E.g. "Secured over $50M in settlements against law enforcement" not "High settlements". Only include facts you are confident are true — do NOT fabricate dollar amounts, case results, or credentials. Do NOT include bar number. Return a JSON array of strings, no markdown, no explanation.${siteContext}`
        break

      case "barNumber":
        prompt = `What is the state bar admission number for ${entityLabel}? Return only the bar number string if known with certainty from your training data or found in the website text. If unknown, return null. No explanation.${siteContext}`
        break

      case "website":
        prompt = `What is the official website URL for ${entityLabel}? Return only the full URL including https:// if known with certainty from your training data. If unknown, return null. No explanation.`
        break

      case "linkedin":
        isArray = true
        prompt = `Generate up to 5 candidate LinkedIn URLs for ${entityLabel}, ordered by confidence. Consider:
- Any exact URL you know from your training data (highest priority — list first)
- Any LinkedIn link found in the website text below (second priority)
- Attorney personal profile variations: linkedin.com/in/firstname-lastname, linkedin.com/in/firstnamelastname, linkedin.com/in/firstname-m-lastname, etc.
- Firm company page variations: linkedin.com/company/firm-name, linkedin.com/company/firmname, etc.
Not all profiles use clean name slugs — some have numbers or abbreviations, so include multiple variations.
Return a JSON array of full https:// URLs only, no markdown, no explanation.${siteContext}`
        break

      case "facebook":
        isArray = true
        prompt = `Generate up to 5 candidate Facebook URLs for ${entityLabel}, ordered by confidence. Consider:
- Any exact URL you know from your training data (highest priority — list first)
- Any Facebook link found in the website text below (second priority)
- Attorney personal profile variations: facebook.com/firstname.lastname, facebook.com/firstnamelastname, etc.
- Firm page variations: facebook.com/firmname, facebook.com/firm.name, facebook.com/the-firm-name, etc.
Not all pages use clean name slugs — some have numbers or custom slugs, so include multiple variations.
Return a JSON array of full https:// URLs only, no markdown, no explanation.${siteContext}`
        break

      case "email":
        prompt = `What is the main contact email for ${entityLabel}? Return only the email address string if found in the website text or known with certainty. If unknown, return null. No explanation.${siteContext}`
        break

      case "phone":
        prompt = `What is the main office phone number for ${entityLabel}? Return only the phone number string if found in the website text or known with certainty. If unknown, return null. No explanation.${siteContext}`
        break

      case "address":
        isObject = true
        prompt = `What is the office address for ${entityLabel}? Return a JSON object with these keys (omit any you cannot find with confidence): streetAddress, city, state (2-letter US abbreviation), zipCode. Return only valid JSON, no markdown, no explanation.${siteContext}`
        break

      default:
        return NextResponse.json({ error: "Unknown field" }, { status: 400 })
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: isArray || isObject ? 1024 : 256,
      messages: [{ role: "user", content: prompt }],
    })

    const raw = message.content[0].type === "text" ? message.content[0].text : ""
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()

    // Social fields: verify each candidate URL, return the first one that resolves
    if (field === "linkedin" || field === "facebook") {
      let candidates: string[] = []
      try { candidates = JSON.parse(cleaned) } catch { /* */ }
      for (const url of candidates) {
        if (typeof url === "string" && url.startsWith("http") && await verifyUrl(url)) {
          return NextResponse.json({ value: url })
        }
      }
      return NextResponse.json({ value: null })
    }

    if (isArray || isObject) {
      try {
        return NextResponse.json({ value: JSON.parse(cleaned) })
      } catch {
        return NextResponse.json({ value: isArray ? [] : null })
      }
    }

    if (cleaned === "null" || cleaned === "") return NextResponse.json({ value: null })
    return NextResponse.json({ value: cleaned })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
