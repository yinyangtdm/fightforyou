import { notFound } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { STATE_NAMES, toSlug } from "../../lib/slugs"
import Nav from "../../components/Nav"
import Footer from "../../components/Footer"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"

export const revalidate = 3600

async function getData(slug: string) {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  const [listing, specialtyRows] = await Promise.all([
    prisma.listing.findUnique({
      where: { slug, approved: true },
    }),
    prisma.$queryRaw<{ specialty: string }[]>`
      SELECT DISTINCT UNNEST(specialties) AS specialty FROM "Listing" ORDER BY specialty
    `,
  ])

  await prisma.$disconnect()
  if (!listing) return null

  return { listing, specialties: specialtyRows.map((r) => r.specialty) }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) return {}

  const { listing } = data
  const stateName = listing.state ? STATE_NAMES[listing.state] ?? listing.state : null
  const location = [listing.city, stateName].filter(Boolean).join(", ")
  const type = listing.isNonprofit ? "Nonprofit" : listing.isFirm ? "Law Firm" : "Attorney"

  return {
    title: `${listing.name} — ${type}${location ? ` in ${location}` : ""} | fightfor.you`,
    description: listing.tagline ?? listing.description?.slice(0, 160) ?? undefined,
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) notFound()

  const { listing, specialties } = data
  const stateName = listing.state ? STATE_NAMES[listing.state] ?? listing.state : null
  const type = listing.isNonprofit ? "Nonprofit" : listing.isFirm ? "Law Firm" : "Attorney"

  return (
    <div className="public profile-public">
      <Nav specialties={specialties} />

      <div className="profile-hero">
        <div className="profile-photo-col">
          <div className="profile-photo-wrap">
            {listing.photoUrl ? (
              <Image
                src={listing.photoUrl}
                alt={listing.name}
                width={240}
                height={240}
                className="profile-img"
              />
            ) : (
              <div className="profile-img-placeholder" />
            )}
            <span className="listing-card-badge profile-badge">{type}</span>
          </div>
        </div>

        <div className="profile-info-col">
          <h1 className="profile-name">{listing.name}</h1>
          {!listing.isNonprofit && !listing.isFirm && listing.firm && listing.name !== listing.firm && (
            <p className="profile-firm">{listing.firm}</p>
          )}
          {[listing.streetAddress, listing.city, stateName, listing.zipCode].filter(Boolean).length > 0 && (
            <p className="profile-address">{[listing.streetAddress, listing.city, stateName, listing.zipCode].filter(Boolean).join(", ")}</p>
          )}
          {listing.specialties.length > 0 && (
            <p className="profile-specialties-inline">{listing.specialties.join(" · ")}</p>
          )}
        </div>

        <div className="profile-actions-col">
          {listing.phone && (
            <a href={`tel:${listing.phone}`} className="btn-primary profile-btn-block">{listing.phone}</a>
          )}
          {listing.email && (
            <a href={`mailto:${listing.email}`} className="btn-primary profile-btn-block profile-btn-ghost">Message</a>
          )}
          {listing.website && (
            <a href={listing.website} target="_blank" rel="noopener noreferrer" className="profile-website-link">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Visit Website
            </a>
          )}
        </div>
      </div>

      <div className="profile-page">

        <div className="profile-body">
          {listing.description && (
            <div className="profile-section">
              <h2>{listing.tagline ?? "About"}</h2>
              <div className="profile-description">
                {listing.description.split(/\n\n+/).map((para, i) => (
                  <p key={i}>{para.trim()}</p>
                ))}
              </div>
            </div>
          )}

          {listing.specialties.length > 0 && (
            <div className="profile-section">
              <h2>Practice Areas</h2>
              <ul className="profile-list">
                {listing.specialties.map((s) => (
                  <li key={s}>
                    <Link href={`/${toSlug(s)}`} className="profile-specialty-link">{s}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {listing.notableResults.length > 0 && (
            <div className="profile-section">
              <h2>Notable Results</h2>
              <ul className="profile-list">
                {listing.notableResults.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {listing.keyCharacteristics.length > 0 && (
            <div className="profile-section">
              <h2>Key Characteristics</h2>
              <ul className="profile-list">
                {listing.keyCharacteristics.map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="profile-section profile-contact">
            {listing.streetAddress && (
              <div className="profile-contact-item">
                <span className="profile-contact-label">Address</span>
                <span>{[listing.streetAddress, listing.city, stateName, listing.zipCode].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {listing.barNumber && (
              <div className="profile-contact-item">
                <span className="profile-contact-label">Bar Number</span>
                <span>{listing.barNumber}</span>
              </div>
            )}
            {listing.linkedin && (
              <div className="profile-contact-item">
                <span className="profile-contact-label">LinkedIn</span>
                <a href={listing.linkedin} target="_blank" rel="noopener noreferrer">{listing.linkedin}</a>
              </div>
            )}
            {listing.facebook && (
              <div className="profile-contact-item">
                <span className="profile-contact-label">Facebook</span>
                <a href={listing.facebook} target="_blank" rel="noopener noreferrer">{listing.facebook}</a>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
