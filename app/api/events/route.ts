import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../lib/prisma"

const VALID_TYPES = ["call", "website", "contact"]

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { slug, eventType } = body

  if (!slug || !VALID_TYPES.includes(eventType)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 })
  }

    await prisma.clickEvent.create({ data: { listingSlug: slug, eventType } })

  return NextResponse.json({ ok: true })
}
