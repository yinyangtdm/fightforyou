import { PrismaClient } from "../../../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { auth } from "../../../../auth"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
})

export async function PATCH(request, { params }) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = parseInt((await params).id)
  if (isNaN(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const nullable = ["email","phone","bio","photoUrl","city","state","zipCode","practiceAreas","notableResults","keyCharacteristics","barNumber","websiteUrl","linkedin","facebook"]
    const direct = ["isFirm","name","slug","approved"]
    const data = {}
    for (const f of nullable) if (f in body) data[f] = body[f] || null
    for (const f of direct) if (f in body) data[f] = body[f]
    const listing = await prisma.listing.update({ where: { id }, data })
    return Response.json(listing)
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Failed to update listing" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
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
