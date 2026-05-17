import { notFound } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { STATE_SLUGS, STATE_NAMES, toSlug } from "../lib/slugs"
import { getSpecialtyDescription } from "../lib/specialty-descriptions"
import Nav from "../components/Nav"
import Footer from "../components/Footer"
import ListingCard from "../components/ListingCard"
import FilingDeadlines from "../components/FilingDeadlines"
import FilterDropdown from "../components/FilterDropdown"
import Breadcrumb from "../components/Breadcrumb"
import type { Metadata } from "next"

export const revalidate = 3600

const SELECT = {
  slug: true, name: true, firm: true, tagline: true, description: true, photoUrl: true,
  city: true, state: true, isFirm: true, isNonprofit: true,
  isNational: true, specialties: true,
}

async function getData(segment: string) {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  const stateAbbr = STATE_SLUGS[segment]

  if (stateAbbr) {
    const [listings, specialtyRows, guideRows] = await Promise.all([
      prisma.listing.findMany({
        where: { state: stateAbbr, approved: true },
        select: SELECT,
        orderBy: { name: "asc" },
      }),
      prisma.$queryRaw<{ specialty: string }[]>`
        SELECT DISTINCT UNNEST(specialties) AS specialty FROM "Listing" ORDER BY specialty
      `,
      prisma.guide.findMany({
        where: { published: true },
        select: { title: true, slug: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ])
    await prisma.$disconnect()
    return {
      type: "state" as const,
      stateAbbr,
      label: STATE_NAMES[stateAbbr],
      listings,
      specialties: specialtyRows.map((r) => r.specialty),
      guides: guideRows,
    }
  }

  const specialtyRows = await prisma.$queryRaw<{ specialty: string }[]>`
    SELECT DISTINCT UNNEST(specialties) AS specialty FROM "Listing"
  `
  const specialty = specialtyRows
    .map((r) => r.specialty)
    .find((s) => toSlug(s) === segment)

  if (!specialty) {
    await prisma.$disconnect()
    return null
  }

  const [listings, allSpecialties, guideRows] = await Promise.all([
    prisma.listing.findMany({
      where: { specialties: { has: specialty }, approved: true },
      select: SELECT,
      orderBy: { name: "asc" },
    }),
    prisma.$queryRaw<{ specialty: string }[]>`
      SELECT DISTINCT UNNEST(specialties) AS specialty FROM "Listing" ORDER BY specialty
    `,
    prisma.guide.findMany({
      where: { published: true },
      select: { title: true, slug: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ])

  await prisma.$disconnect()
  return {
    type: "specialty" as const,
    label: specialty,
    listings,
    specialties: allSpecialties.map((r) => r.specialty),
    guides: guideRows,
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string }>
}): Promise<Metadata> {
  const { segment } = await params
  const data = await getData(segment)
  if (!data) return {}

  const title =
    data.type === "state"
      ? `Lawyers in ${data.label}`
      : `${data.label} Lawyers`

  return {
    title: `${title} | fightfor.you`,
    description: `Find verified ${data.type === "state" ? `civil rights lawyers in ${data.label}` : `${data.label} attorneys`} with a proven record against law enforcement.`,
  }
}

export default async function SegmentPage({
  params,
}: {
  params: Promise<{ segment: string }>
}) {
  const { segment } = await params
  const data = await getData(segment)
  if (!data) notFound()

  const { specialties, guides } = data

  const heading =
    data.type === "state"
      ? `Lawyers in ${data.label}`
      : `${data.label} Lawyers`

  const subheading =
    data.type === "state"
      ? `Attorneys and firms with a proven record against law enforcement in ${data.label}.`
      : (getSpecialtyDescription(data.label) ?? `Attorneys and firms specializing in ${data.label}.`)

  return (
    <div className="public">
      <Nav specialties={specialties} guides={guides} />

      <div className="listing-page">
        <div className="breadcrumb-container">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: data.label },
            ]}
          />
        </div>

        <div className="listing-header">
          <h1>{heading}</h1>
          <p className="listing-subheading">{subheading}</p>
          <div className="listing-filter-row">
            <span className="listing-count">{data.listings.length} results</span>
            {data.type === "state" && (
              <FilterDropdown
                type="state"
                options={[...new Set(data.listings.flatMap((l) => l.specialties))].sort()}
                currentSlug={data.stateAbbr.toLowerCase()}
              />
            )}
            {data.type === "specialty" && (
              <FilterDropdown
                type="specialty"
                options={[...new Set(data.listings.map((l) => l.state).filter((s): s is string => !!s))]
                  .map((abbr) => STATE_NAMES[abbr])
                  .filter(Boolean)
                  .sort()}
                currentSlug={toSlug(data.label)}
              />
            )}
          </div>
        </div>

        <div className="listing-section">
          <div className="listing-grid">
            {data.listings.map((listing) => (
              <ListingCard key={listing.slug} listing={listing} />
            ))}
            {data.listings.length === 0 && (
              <p className="listing-empty">No listings found.</p>
            )}
          </div>
        </div>

        {data.type === "state" && <FilingDeadlines stateAbbr={data.stateAbbr} />}
      </div>

      <Footer />
    </div>
  )
}
