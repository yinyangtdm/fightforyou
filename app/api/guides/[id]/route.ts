import { prisma } from "../../../lib/prisma"
import { auth } from "../../../../auth"
import { NextRequest } from "next/server"

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
    const nullable = ["excerpt", "coverImageUrl", "authorName", "authorSlug"]
    const direct = ["title", "slug", "body", "categories", "published", "featured"]
    const data: Record<string, unknown> = {}
    for (const f of nullable) if (f in body) data[f] = body[f] || null
    for (const f of direct) if (f in body) data[f] = body[f]
    const guide = await prisma.guide.update({ where: { id }, data })
    return Response.json(guide)
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Failed to update guide" }, { status: 500 })
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
    await prisma.guide.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Failed to delete guide" }, { status: 500 })
  }
}
