import { notFound } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { STATE_SLUGS, STATE_NAMES, toSlug } from "../lib/slugs"
import { getSpecialtyDescription } from "../lib/specialty-descriptions"
import NavServer from "../components/NavServer"
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
  additionalStates: true, specialties: true,
}

async function getData(segment: string) {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  const stateAbbr = STATE_SLUGS[segment]

  if (stateAbbr) {
    const listings = await prisma.listing.findMany({
      where: { approved: true, OR: [{ state: stateAbbr }, { additionalStates: { has: stateAbbr } }] },
      select: SELECT,
      orderBy: { name: "asc" },
    })
    await prisma.$disconnect()
    return {
      type: "state" as const,
      stateAbbr,
      label: STATE_NAMES[stateAbbr],
      listings,
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

  await prisma.$disconnect()
  return {
    type: "specialty" as const,
    label: specialty,
    listings,
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
      ? `${data.label} Attorneys with the Best Track Records Against Law Enforcement`
      : `${data.label} Attorneys`

  const description =
    data.type === "state"
      ? `Browse attorneys in ${data.label} who fight law enforcement — police misconduct, excessive force, wrongful arrest, wrongful death, and more.`
      : `Find ${data.label} attorneys with proven records against law enforcement. Browse profiles with case results, contact info, and background on each attorney.`

  return { title, description }
}

export default async function SegmentPage({
  params,
}: {
  params: Promise<{ segment: string }>
}) {
  const { segment } = await params
  const data = await getData(segment)
  if (!data) notFound()

  const heading =
    data.type === "state"
      ? `Attorneys in ${data.label}`
      : `${data.label} Attorneys`

  const subheading =
    data.type === "state"
      ? `Attorneys and firms with a proven record against law enforcement in ${data.label}.`
      : (getSpecialtyDescription(data.label) ?? `Attorneys and firms specializing in ${data.label}.`)

  return (
    <div className="public">
      <NavServer />

      <main className="listing-page" id="main-content">
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
      </main>

      <Footer />
    </div>
  )
}
