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
    const [listings, specialtyRows] = await Promise.all([
      prisma.listing.findMany({
        where: { state: stateAbbr, approved: true },
        select: SELECT,
        orderBy: { name: "asc" },
      }),
      prisma.$queryRaw<{ specialty: string }[]>`
        SELECT DISTINCT UNNEST(specialties) AS specialty FROM "Listing" ORDER BY specialty
      `,
    ])
    await prisma.$disconnect()
    return {
      type: "state" as const,
      stateAbbr,
      label: STATE_NAMES[stateAbbr],
      listings,
      specialties: specialtyRows.map((r) => r.specialty),
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

  const listings = await prisma.listing.findMany({
    where: { specialties: { has: specialty }, approved: true },
    select: SELECT,
    orderBy: { name: "asc" },
  })

  const specialties = await prisma.$queryRaw<{ specialty: string }[]>`
    SELECT DISTINCT UNNEST(specialties) AS specialty FROM "Listing" ORDER BY specialty
  `

  await prisma.$disconnect()
  return {
    type: "specialty" as const,
    label: specialty,
    listings,
    specialties: specialties.map((r) => r.specialty),
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

  const specialties = data.specialties

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
      <Nav specialties={specialties} />

      <div className="listing-page">
        <div className="listing-page-header">
          <h1>{heading}</h1>
          {data.type === "specialty" && <p>{subheading}</p>}
          {data.type === "state" && <p className="listing-page-subheading">{subheading}</p>}
          <div className="listing-page-filter-row">
            <span className="listing-page-count">{data.listings.length} results</span>
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

        <div className="listing-grid">
          {data.listings.map((listing) => (
            <ListingCard key={listing.slug} listing={listing} />
          ))}
          {data.listings.length === 0 && (
            <p className="listing-empty">No listings found.</p>
          )}
        </div>

        {data.type === "state" && (
          <div className="mt-12">
            <FilingDeadlines stateAbbr={data.stateAbbr} />
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
