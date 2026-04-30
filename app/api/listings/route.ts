import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { auth } from "../../../auth"
import { NextRequest } from "next/server"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
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

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json() as {
      isFirm?: boolean
      name: string
      slug: string
      email?: string
      phone?: string
      bio?: string
      photoUrl?: string
      city?: string
      state?: string
      zipCode?: string
      specialties?: string[]
      notableResults?: string[]
      keyCharacteristics?: string[]
      barNumber?: string
      websiteUrl?: string
      linkedin?: string
      facebook?: string
      approved?: boolean
    }
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
        specialties: body.specialties ?? [],
        notableResults: body.notableResults ?? [],
        keyCharacteristics: body.keyCharacteristics ?? [],
        barNumber: body.barNumber || null,
        websiteUrl: body.websiteUrl || null,
        linkedin: body.linkedin || null,
        facebook: body.facebook || null,
        approved: body.approved || false,
      },
    })
    return Response.json(listing, { status: 201 })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Failed to create listing" }, { status: 500 })
  }
}
