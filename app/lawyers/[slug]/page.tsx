import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { STATE_NAMES, STATE_SLUGS, toSlug } from "../../lib/slugs"
import Nav from "../../components/Nav"
import Footer from "../../components/Footer"
import Breadcrumb from "../../components/Breadcrumb"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import SpecialtyList from "../../components/SpecialtyList"

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
  const headersList = await headers()
  const referer = headersList.get("referer") ?? ""
  const from = referer ? new URL(referer).pathname : ""
  const data = await getData(slug)
  if (!data) notFound()

  const { listing, specialties } = data
  const stateName = listing.state ? STATE_NAMES[listing.state] ?? listing.state : null
  const type = listing.isNonprofit ? "Nonprofit" : listing.isFirm ? "Law Firm" : "Attorney"
  const badgeClass = listing.isNonprofit ? "listing-card-badge--nonprofit" : listing.isFirm ? "listing-card-badge--firm" : ""

  // Build breadcrumb items based on actual user path
  const breadcrumbItems = [{ label: "Home", href: "/" }]
  
  if (from) {
    // Parse the referrer path to build accurate breadcrumbs
    const pathParts = from.split('/').filter(Boolean)
  
    if (pathParts.length === 1) {
      // Single segment: either state or specialty
      const segment = pathParts[0]
      const stateAbbr = Object.entries(STATE_SLUGS).find(([slug]) => slug === segment)?.[1]
    
      if (stateAbbr) {
        // User came from a state page
        breadcrumbItems.push({
          label: STATE_NAMES[stateAbbr],
          href: `/${segment}`,
        })
      } else {
        // User came from a specialty page
        const specialty = listing.specialties.find(s => toSlug(s) === segment)
        if (specialty) {
          breadcrumbItems.push({
            label: specialty,
            href: `/${segment}`,
          })
        }
      }
    } else if (pathParts.length === 2) {
      // Two segments: specialty + state
      const [specialtySlug, stateSlug] = pathParts
      const stateAbbr = Object.entries(STATE_SLUGS).find(([slug]) => slug === stateSlug)?.[1]
      const specialty = listing.specialties.find(s => toSlug(s) === specialtySlug)
       if (stateAbbr) {
        breadcrumbItems.push({
          label: STATE_NAMES[stateAbbr],
          href: `/${stateSlug}`,
        })
      }
    
      if (specialty) {
        breadcrumbItems.push({
          label: specialty,
          href: `/${specialtySlug}/${stateSlug}`,
        })
      }
    }
  }

  breadcrumbItems.push({ label: listing.name, href: "" })

  return (
    <div className="public profile-public">
      <Nav specialties={specialties} guides={[]} />

      <div className="breadcrumb-container">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="profile-hero-outer">
        <div className="profile-hero">
          <div className="profile-photo-col">
          <div className="profile-photo-wrap">
            {listing.photoUrl ? (
              <Image
                src={listing.photoUrl}
                alt={listing.name}
                width={200}
                height={200}
                className="profile-img"
              />
            ) : (
              <div className="profile-img-placeholder" />
            )}
          </div>
            <span className={`listing-card-badge profile-badge ${badgeClass}`}>{type}</span>
          </div>

          <div className="profile-info-col">
          <div className="profile-info-identity">
            <h1 className="profile-name">{listing.name}</h1>
            {!listing.isNonprofit && !listing.isFirm && listing.firm && listing.name !== listing.firm && (
              <div className="profile-field">
                <svg className="profile-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                  <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                  <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                  <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
                </svg>
                <p className="profile-firm">{listing.firm}</p>
              </div>
            )}
          </div>
          <div className="profile-info-details">
            {[listing.streetAddress, listing.city, stateName, listing.zipCode].filter(Boolean).length > 0 && (
              <div className="profile-field">
                <svg className="profile-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <p className="profile-address">{[listing.streetAddress, listing.city, stateName, listing.zipCode].filter(Boolean).join(", ")}</p>
              </div>
            )}
            {listing.specialties.length > 0 && (
              <div className="profile-field">
                <svg className="profile-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                  <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                  <path d="M7 21h10"/><path d="M12 3v18"/>
                  <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
                </svg>
                <SpecialtyList specialties={listing.specialties} />
              </div>
            )}
          </div>
          </div>

          <div className="profile-actions-col">
          {listing.phone && (
            <a href={`tel:${listing.phone}`} className="btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {listing.phone}
            </a>
          )}
          {listing.email && (
            <a href={`mailto:${listing.email}`} className="btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 5L2 7" />
              </svg>
              Message Me
            </a>
          )}
          {listing.website && (
            <a href={listing.website} target="_blank" rel="noopener noreferrer" className="btn-primary btn-website">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Visit Website
            </a>
          )}
        </div>
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

          {listing.specialties.length > 0 && (
            <div className="profile-map-row">
              <div className="profile-section profile-section--areas">
                <h2>Practice Areas</h2>
                <ul className="profile-list">
                  {listing.specialties.map((s) => (
                    <li key={s}>
                      <Link href={`/${toSlug(s)}`} className="profile-specialty-link">{s}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="profile-map-placeholder" />
            </div>
          )}

          <div className="profile-section profile-contact">
            {listing.streetAddress && (
              <div className="profile-contact-item">
                <span className="profile-contact-label">Address</span>
                <span>{[listing.streetAddress, listing.city, stateName, listing.zipCode].filter(Boolean).join(", ")}</span>
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