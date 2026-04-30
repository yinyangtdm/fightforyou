import { PrismaClient } from "../../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { auth } from "../../../auth"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
})

export async function GET() {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const listings = await prisma.listing.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    })
    return Response.json(listings)
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Failed to fetch listings" }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const listing = await prisma.listing.create({
      data: {
        isFirm: body.isFirm || false,
        name: body.name,
        slug: body.slug,
        email: body.email || null,
        phone: body.phone || null,
        bio: body.bio || null,
        photoUrl: body.photoUrl || null,
        city: body.city || null,
        state: body.state || null,
        zipCode: body.zipCode || null,
        practiceAreas: body.practiceAreas || null,
        notableResults: body.notableResults || null,
        keyCharacteristics: body.keyCharacteristics || null,
        barNumber: body.barNumber || null,
        websiteUrl: body.websiteUrl || null,
        linkedin: body.linkedin || null,
        facebook: body.facebook || null,
        twitter: body.twitter || null,
        approved: body.approved || false,
      }
    })
    return Response.json(listing, { status: 201 })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Failed to create listing" }, { status: 500 })
  }
}