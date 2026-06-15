import { notFound } from "next/navigation"
import { prisma } from "../../lib/prisma"
import { STATE_SLUGS, STATE_NAMES, toSlug } from "../../lib/slugs"
import { getSpecialtyDescription } from "../../lib/specialty-descriptions"
import { isDbUnavailable } from "../../lib/db-errors"
import NavServer from "../../components/NavServer"
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

  try {
    const specialtyRows = await prisma.$queryRaw<{ specialty: string }[]>`
      SELECT DISTINCT UNNEST(specialties) AS specialty FROM "Listing"
    `
    const specialty = specialtyRows
      .map((r) => r.specialty)
      .find((s) => toSlug(s) === specialtySegment)

    if (!specialty) {
      return null
    }

    const listings = await prisma.listing.findMany({
      where: { specialties: { has: specialty }, approved: true, OR: [{ state: stateAbbr }, { additionalStates: { has: stateAbbr } }] },
      select: SELECT,
      orderBy: { name: "asc" },
    })

    return {
      specialty,
      stateAbbr,
      stateName: STATE_NAMES[stateAbbr],
      listings,
    }
  } catch (error) {
    if (isDbUnavailable(error)) {
      return { type: "unavailable" as const, stateName: STATE_NAMES[stateAbbr] }
    }
    throw error
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string; state: string }>
}): Promise<Metadata> {
  const { segment, state } = await params
  const data = await getData(segment, state)
  if (!data || ("type" in data && data.type === "unavailable")) return {}

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
  if ("type" in data && data.type === "unavailable") {
    return (
      <div className="public">
        <NavServer />
        <main className="listing-page" id="main-content">
          <div className="listing-header">
            <h1>Directory temporarily unavailable</h1>
            <p className="listing-subheading">
              We could not reach the database. Check your connection and try again.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${data.specialty} Attorneys in ${data.stateName}`,
    "url": `https://fightfor.you/${segment}/${state}`,
    "numberOfItems": data.listings.length,
    "itemListElement": data.listings.map((l, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": l.name,
      "url": `https://fightfor.you/attorneys/${l.slug}`,
    })),
  }

  return (
    <div className="public">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NavServer />

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
