import { notFound } from "next/navigation"
import { prisma } from "../../../lib/prisma"
import { isDbUnavailable } from "../../../lib/db-errors"
import NavServer from "../../../components/NavServer"
import Footer from "../../../components/Footer"
import Image from "next/image"
import type { Metadata } from "next"
import ContactForm from "./ContactForm"

const STATE_NAMES: Record<string, string> = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",
  CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",
  IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",
  ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",
  MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",
  NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",
  NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",
  PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",
  TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",
  WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",DC:"Washington D.C.",
}

async function getListing(slug: string) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { slug, approved: true },
      select: {
        name: true,
        slug: true,
        isFirm: true,
        isNonprofit: true,
        phone: true,
        photoUrl: true,
        streetAddress: true,
        city: true,
        state: true,
        zipCode: true,
        specialties: true,
      },
    })
    return listing
  } catch (error) {
    if (isDbUnavailable(error)) return "unavailable" as const
    throw error
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const listing = await getListing(slug)
  if (!listing || listing === "unavailable") return {}

  const type = listing.isNonprofit ? "Nonprofit" : listing.isFirm ? "Law Firm" : "Attorney"
  const stateName = listing.state ? STATE_NAMES[listing.state] ?? listing.state : null
  const location = [listing.city, stateName].filter(Boolean).join(", ")
  const title = `Contact ${listing.name} — ${type}${location ? ` in ${location}` : ""}`
  const description = `Send a message to ${listing.name}${location ? `, a civil rights ${type.toLowerCase()} in ${location}` : ""}. Describe your legal situation and get in touch directly.`

  return {
    title,
    description,
    alternates: { canonical: `https://fightfor.you/attorneys/${slug}/contact` },
    openGraph: {
      title,
      description,
      url: `https://fightfor.you/attorneys/${slug}/contact`,
      type: "website",
      siteName: "Fight For You",
      ...(listing.photoUrl && { images: [{ url: listing.photoUrl, width: 400, height: 400, alt: listing.name }] }),
    },
    twitter: {
      card: "summary",
      title,
      description,
      ...(listing.photoUrl && { images: [listing.photoUrl] }),
    },
    robots: { index: true, follow: true },
  }
}

export default async function ContactPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const listing = await getListing(slug)
  if (!listing) notFound()
  if (listing === "unavailable") {
    return (
      <div className="public">
        <NavServer />
        <main className="contact-page" id="main-content">
          <div className="contact-page-inner">
            <h1>Contact form temporarily unavailable</h1>
            <p>We could not reach the database. Check your connection and try again.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const addressParts = [
    listing.streetAddress,
    listing.city,
    listing.state && listing.zipCode
      ? `${listing.state} ${listing.zipCode}`
      : listing.state ?? listing.zipCode,
  ].filter(Boolean)

  return (
    <div className="public">
      <NavServer />
      <main className="contact-page" id="main-content">
        <div className="contact-page-inner">
          <div className="contact-attorney-card">
            <div className="contact-attorney-header">
              <div className="contact-photo-wrap">
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
                <span className={`listing-card-badge profile-badge ${listing.isNonprofit ? "listing-card-badge--nonprofit" : listing.isFirm ? "listing-card-badge--firm" : ""}`}>
                  {listing.isNonprofit ? "Nonprofit" : listing.isFirm ? "Law Firm" : "Attorney"}
                </span>
              </div>
              <h1 className="contact-page-title">Contact {listing.name}</h1>
            </div>
            <dl className="contact-attorney-details">
              {addressParts.length > 0 && (
                <div className="contact-attorney-row">
                  <dt>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0Z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span className="sr-only">Address</span>
                  </dt>
                  <dd>{addressParts.join(", ")}</dd>
                </div>
              )}
              {listing.phone && (
                <div className="contact-attorney-row">
                  <dt>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span className="sr-only">Phone</span>
                  </dt>
                  <dd>{listing.phone}</dd>
                </div>
              )}
              {listing.specialties.length > 0 && (
                <div className="contact-attorney-row">
                  <dt>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                    <span className="sr-only">Practice Areas</span>
                  </dt>
                  <dd>{listing.specialties.join(" · ")}</dd>
                </div>
              )}
            </dl>
          </div>

          <ContactForm slug={slug} attorneyName={listing.name} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
