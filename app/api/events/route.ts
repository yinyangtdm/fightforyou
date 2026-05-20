import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const VALID_TYPES = ["call", "website", "contact"]

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { slug, eventType } = body

  if (!slug || !VALID_TYPES.includes(eventType)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 })
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  await prisma.clickEvent.create({ data: { listingSlug: slug, eventType } })

  return NextResponse.json({ ok: true })
}
