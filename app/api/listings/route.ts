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
      isNonprofit?: boolean
      name: string
      slug: string
      firm?: string
      tagline?: string
      email?: string
      phone?: string
      description?: string
      photoUrl?: string
      streetAddress?: string
      city?: string
      state?: string
      zipCode?: string
      additionalStates?: string[]
      specialties?: string[]
      notableResults?: string[]
      keyCharacteristics?: string[]
      barNumber?: string
      website?: string
      linkedin?: string
      facebook?: string
      approved?: boolean
      featured?: boolean
    }
    const listing = await prisma.listing.create({
      data: {
        isFirm: body.isFirm ?? false,
        isNonprofit: body.isNonprofit ?? false,
        name: body.name,
        slug: body.slug,
        firm: body.firm || null,
        tagline: body.tagline || null,
        email: body.email || null,
        phone: body.phone || null,
        description: body.description || null,
        photoUrl: body.photoUrl || null,
        streetAddress: body.streetAddress || null,
        city: body.city || null,
        state: body.state || null,
        zipCode: body.zipCode || null,
        additionalStates: body.additionalStates ?? [],
        specialties: body.specialties ?? [],
        notableResults: body.notableResults ?? [],
        keyCharacteristics: body.keyCharacteristics ?? [],
        barNumber: body.barNumber || null,
        website: body.website || null,
        linkedin: body.linkedin || null,
        facebook: body.facebook || null,
        approved: body.approved || false,
        featured: body.featured || false,
      },
    })
    return Response.json(listing, { status: 201 })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Failed to create listing" }, { status: 500 })
  }
}
