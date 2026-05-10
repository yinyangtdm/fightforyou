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
    const guides = await prisma.guide.findMany({
      orderBy: { createdAt: "desc" },
    })
    return Response.json(guides)
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Failed to fetch guides" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json() as {
      title: string
      slug: string
      excerpt?: string
      body: string
      categories?: string[]
      coverImageUrl?: string
      authorName?: string
      authorSlug?: string
      published?: boolean
      featured?: boolean
    }
    const guide = await prisma.guide.create({
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt || null,
        body: body.body,
        categories: body.categories ?? [],
        coverImageUrl: body.coverImageUrl || null,
        authorName: body.authorName || null,
        authorSlug: body.authorSlug || null,
        published: body.published ?? false,
        featured: body.featured ?? false,
      },
    })
    return Response.json(guide, { status: 201 })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Failed to create guide" }, { status: 500 })
  }
}
