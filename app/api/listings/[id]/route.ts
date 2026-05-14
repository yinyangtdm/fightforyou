import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { auth } from "../../../../auth"
import { NextRequest } from "next/server"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = parseInt((await params).id)
  if (isNaN(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 })
  }

  try {
    const body = await request.json() as Record<string, unknown>
    const nullable = ["email", "phone", "description", "photoUrl", "streetAddress", "city", "state", "zipCode", "firm", "tagline", "barNumber", "website", "linkedin", "facebook"]
    const direct = ["isFirm", "isNonprofit", "name", "slug", "isNational", "approved", "featured", "latitude", "longitude"]
    const arrays = ["specialties", "notableResults", "keyCharacteristics"]
    const data: Record<string, unknown> = {}
    for (const f of nullable) if (f in body) data[f] = body[f] || null
    for (const f of direct) if (f in body) data[f] = body[f]
    for (const f of arrays) if (f in body) data[f] = Array.isArray(body[f]) ? body[f] : []
    const listing = await prisma.listing.update({ where: { id }, data })
    return Response.json(listing)
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Failed to update listing" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = parseInt((await params).id)
  if (isNaN(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 })
  }

  try {
    await prisma.listing.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Failed to delete listing" }, { status: 500 })
  }
}
