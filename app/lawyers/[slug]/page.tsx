import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { STATE_NAMES, STATE_SLUGS, toSlug } from "../../lib/slugs"
import NavServer from "../../components/NavServer"
import Footer from "../../components/Footer"
import Breadcrumb from "../../components/Breadcrumb"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import SpecialtyList from "../../components/SpecialtyList"
import AdditionalStatesList from "../../components/AdditionalStatesList"
import ProfileMap from "../../components/ProfileMap"
import ShareButton from "../../components/ShareButton"
import ProfileButtons from "./ProfileButtons"

export const revalidate = 3600

async function getData(slug: string) {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  const listing = await prisma.listing.findUnique({
    where: { slug, approved: true },
  })

  await prisma.$disconnect()
  if (!listing) return null

  return { listing }
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

  const description = listing.tagline ?? listing.description?.slice(0, 160) ?? undefined

  return {
    title: `${listing.name} — ${type}${location ? ` in ${location}` : ""}`,
    description,
    openGraph: {
      title: `${listing.name} — ${type}${location ? ` in ${location}` : ""}`,
      description,
      type: "profile",
      images: listing.photoUrl
        ? [{ url: listing.photoUrl, width: 400, height: 400 }]
        : undefined,
    },
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

  const { listing } = data
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

  const stateSlug = listing.state
    ? Object.entries(STATE_SLUGS).find(([, abbr]) => abbr === listing.state)?.[0]
    : null

  const breadcrumbLd = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://fightfor.you" },
      ...(stateSlug && stateName ? [{ "@type": "ListItem", "position": 2, "name": stateName, "item": `https://fightfor.you/${stateSlug}` }] : []),
      { "@type": "ListItem", "position": stateSlug ? 3 : 2, "name": listing.name },
    ],
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
    {
    "@type": listing.isFirm ? "LegalService" : "Attorney",
    "name": listing.name,
    "description": listing.tagline ?? listing.description?.slice(0, 200) ?? undefined,
    "url": `https://fightfor.you/lawyers/${listing.slug}`,
    ...(listing.phone && { "telephone": listing.phone }),
    ...(listing.website && { "sameAs": listing.website }),
    ...((listing.streetAddress || listing.city || listing.state) && {
      "address": {
        "@type": "PostalAddress",
        ...(listing.streetAddress && { "streetAddress": listing.streetAddress }),
        ...(listing.city && { "addressLocality": listing.city }),
        ...(listing.state && { "addressRegion": listing.state }),
        ...(listing.zipCode && { "postalCode": listing.zipCode }),
        "addressCountry": "US",
      },
    }),
    "areaServed": listing.additionalStates.length > 0
      ? [listing.state, ...listing.additionalStates].filter(Boolean)
      : listing.state ?? undefined,
    ...(listing.photoUrl && { "image": listing.photoUrl }),
    ...(listing.specialties.length > 0 && { "knowsAbout": listing.specialties }),
    },
    breadcrumbLd,
  ],
  }

  return (
    <div className="public profile-public">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NavServer />

      <main className="profile-page" id="main-content">
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
            <span className={`listing-card-badge profile-badge ${badgeClass}`}>{type}</span>
          </div>
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
            {listing.additionalStates.length > 0 && (
              <div className="profile-field">
                <svg className="profile-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>
                </svg>
                <AdditionalStatesList states={listing.additionalStates} />
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
          <div className="profile-share-row">
            <ShareButton name={listing.name} />
          </div>
          <ProfileButtons slug={listing.slug} phone={listing.phone} website={listing.website} />
        </div>
        </div>
        </div>

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

          <div className="profile-map-row">
            {listing.specialties.length > 0 && (
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
            )}
            {listing.latitude && listing.longitude ? (
              <div className="profile-map-placeholder">
                <ProfileMap latitude={listing.latitude} longitude={listing.longitude} name={listing.name} />
              </div>
            ) : (
              <div className="profile-map-placeholder" />
            )}
          </div>

          <div className="profile-section profile-contact">
            {listing.streetAddress && (
              <div className="profile-contact-item">
                <svg className="profile-contact-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{[listing.streetAddress, listing.city, stateName, listing.zipCode].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {listing.linkedin && (
              <div className="profile-contact-item">
                <svg className="profile-contact-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
                <a href={listing.linkedin} target="_blank" rel="noopener noreferrer">{listing.linkedin}</a>
              </div>
            )}
            {listing.facebook && (
              <div className="profile-contact-item">
                <svg className="profile-contact-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                <a href={listing.facebook} target="_blank" rel="noopener noreferrer">{listing.facebook}</a>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}