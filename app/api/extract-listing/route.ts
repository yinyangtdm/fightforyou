import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const { text } = await req.json() as { text: string }
    if (!text?.trim()) return NextResponse.json({ error: "No text provided" }, { status: 400 })

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Extract lawyer/firm listing fields from the following bio text. Return only a JSON object with these exact keys (omit keys where no information is found):
- name (string)
- firm (string)
- isFirm (boolean — true if the listing is itself a law firm rather than an individual)
- isNonprofit (boolean)
- tagline (string — short memorable nickname-like description, ideally 3-5 words, that captures the essence of the lawyer or firm and uniquely distinguishes them from the others in the databse; for example, "The Top Personal Injury Lawyer" or "Award-Winning Civil Rights Firm")
- email (string)
- phone (string)
- description (string — full multi-paragraph bio paraphrased from the source, with an authoritative tone; do not summarize or shorten; separate paragraphs with the escaped newline sequence \\n\\n so the JSON remains valid)
- streetAddress (string)
- city (string)
- state (2-letter US state abbreviation)
- zipCode (string)
- specialties (comma-separated string of practice areas)
- notableResults (array of strings — case results, verdicts, settlements)
- keyCharacteristics (array of strings — traits, languages, awards, credentials -  do NOT include bar numbers here)
- barNumber (string - bar admission number, do NOT include this in keyCharacteristics)
- website (string — full URL)
- linkedin (string — full URL)
- facebook (string — full URL)

Return only valid JSON, no markdown, no explanation.

Bio text:
${text}`,
        },
      ],
    })

    const raw = message.content[0].type === "text" ? message.content[0].text : ""
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()
    try {
      const data = JSON.parse(cleaned) as Record<string, unknown>
      return NextResponse.json(data)
    } catch {
      return NextResponse.json({ error: "Failed to parse response", raw }, { status: 500 })
    }
  } catch (error) {
    console.error("Extract listing error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}