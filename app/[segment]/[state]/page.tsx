import { notFound } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { STATE_SLUGS, STATE_NAMES, toSlug } from "../../lib/slugs"
import { getSpecialtyDescription } from "../../lib/specialty-descriptions"
import Nav from "../../components/Nav"
import Footer from "../../components/Footer"
import ListingCard from "../../components/ListingCard"
import FilingDeadlines from "../../components/FilingDeadlines"
import Breadcrumb from "../../components/Breadcrumb"
import type { Metadata } from "next"

export const revalidate = 3600

const SELECT = {
  slug: true, name: true, firm: true, tagline: true, description: true, photoUrl: true,
  city: true, state: true, isFirm: true, isNonprofit: true,
  additionalStates: true, specialties: true,
}

async function getData(specialtySegment: string, stateSegment: string) {
  const stateAbbr = STATE_SLUGS[stateSegment]
  if (!stateAbbr) return null

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  const specialtyRows = await prisma.$queryRaw<{ specialty: string }[]>`
    SELECT DISTINCT UNNEST(specialties) AS specialty FROM "Listing"
  `
  const specialty = specialtyRows
    .map((r) => r.specialty)
    .find((s) => toSlug(s) === specialtySegment)

  if (!specialty) {
    await prisma.$disconnect()
    return null
  }

  const [listings, allSpecialties, guideRows] = await Promise.all([
    prisma.listing.findMany({
      where: { specialties: { has: specialty }, approved: true, OR: [{ state: stateAbbr }, { additionalStates: { has: stateAbbr } }] },
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
    specialty,
    stateAbbr,
    stateName: STATE_NAMES[stateAbbr],
    listings,
    specialties: allSpecialties.map((r) => r.specialty),
    guides: guideRows,
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string; state: string }>
}): Promise<Metadata> {
  const { segment, state } = await params
  const data = await getData(segment, state)
  if (!data) return {}

  return {
    title: `${data.specialty} Attorneys in ${data.stateName}`,
    description: `Browse ${data.specialty} attorneys in ${data.stateName} with track records against law enforcement. Profiles include case results, contact info, and background on each attorney.`,
  }
}

export default async function SpecialtyStatePage({
  params,
}: {
  params: Promise<{ segment: string; state: string }>
}) {
  const { segment, state } = await params
  const data = await getData(segment, state)
  if (!data) notFound()

  return (
    <div className="public">
      <Nav specialties={data.specialties} guides={data.guides} />

      <main className="listing-page" id="main-content">
        <div className="breadcrumb-container">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: data.stateName, href: `/${state}` },
              { label: data.specialty },
            ]}
          />
        </div>

        <div className="listing-header">
          <h1>{data.specialty} Attorneys in {data.stateName}</h1>
          <p className="listing-subheading">
            {getSpecialtyDescription(data.specialty) ?? `Attorneys and firms specializing in ${data.specialty} in ${data.stateName}, with a proven record against law enforcement.`}
          </p>
          <div className="listing-filter-row">
            <span className="listing-count">{data.listings.length} results</span>
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

        <FilingDeadlines stateAbbr={data.stateAbbr} />
      </main>

      <Footer />
    </div>
  )
}
