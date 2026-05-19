export const dynamic = "force-dynamic"

import type { MetadataRoute } from "next"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { toSlug, STATE_SLUGS } from "./lib/slugs"

const BASE = "https://fightfor.you"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  const [listings, specialtyRows, guides] = await Promise.all([
    prisma.listing.findMany({
      where: { approved: true },
      select: { slug: true, specialties: true, state: true },
    }),
    prisma.$queryRaw<{ specialty: string }[]>`
      SELECT DISTINCT UNNEST(specialties) AS specialty FROM "Listing" WHERE approved = true ORDER BY specialty
    `,
    prisma.guide.findMany({
      where: { published: true },
      select: { slug: true },
    }),
  ])

  await prisma.$disconnect()

  // Build specialty+state combos that actually have listings
  const specialtyStateCombos = new Set<string>()
  for (const listing of listings) {
    if (!listing.state) continue
    const stateSlug = Object.entries(STATE_SLUGS).find(([slug, abbr]) => abbr === listing.state)?.[0]
    if (!stateSlug) continue
    for (const specialty of listing.specialties) {
      specialtyStateCombos.add(`${toSlug(specialty)}/${stateSlug}`)
    }
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/guides`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/guides/glossary`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/guides/filing-deadlines-by-state`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/guides/qualified-immunity`, changeFrequency: "monthly", priority: 0.6 },
  ]

  const lawyerPages: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${BASE}/lawyers/${l.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  const specialtyPages: MetadataRoute.Sitemap = specialtyRows.map((r) => ({
    url: `${BASE}/${toSlug(r.specialty)}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  const specialtyStatePages: MetadataRoute.Sitemap = [...specialtyStateCombos].map((combo) => ({
    url: `${BASE}/${combo}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  const guidePages: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${BASE}/guides/${g.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  return [...staticPages, ...lawyerPages, ...specialtyPages, ...specialtyStatePages, ...guidePages]
}