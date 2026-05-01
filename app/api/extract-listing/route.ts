import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
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
- tagline (string — short memorable phrase)
- email (string)
- phone (string)
- description (string — bio/summary paragraph)
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
  try {
    const data = JSON.parse(raw) as Record<string, unknown>
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to parse response", raw }, { status: 500 })
  }
}
