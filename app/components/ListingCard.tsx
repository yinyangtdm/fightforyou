import Link from "next/link"
import Image from "next/image"
import { STATE_NAMES } from "../lib/slugs"

type Listing = {
  slug: string
  name: string
  firm: string | null
  tagline: string | null
  description: string | null
  photoUrl: string | null
  city: string | null
  state: string | null
  isFirm: boolean
  isNonprofit: boolean
  additionalStates: string[]
  specialties: string[]
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const href = `/attorneys/${listing.slug}`
  const location = [listing.city, listing.state]
    .filter(Boolean)
    .join(", ")

  const specialties = [...new Set(listing.specialties)].sort((a, b) => a.localeCompare(b))

  const badge = listing.isNonprofit
    ? "Nonprofit"
    : listing.isFirm
    ? "Law Firm"
    : "Attorney"

  const badgeClass = listing.isNonprofit
    ? "listing-card-badge--nonprofit"
    : listing.isFirm
    ? "listing-card-badge--firm"
    : "listing-card-badge--attorney"

  const bioPreview = listing.description
    ? listing.description.substring(0, 220)
    : null

  return (
    <Link href={href} className="listing-card">
      <div className="listing-card-top">
        <div className="listing-card-photo">
          {listing.photoUrl ? (
            <Image
              src={listing.photoUrl}
              alt={listing.name}
              width={144}
              height={144}
              className="listing-card-img"
            />
          ) : (
            <div className="listing-card-img-placeholder" />
          )}
          <span className={`listing-card-badge ${badgeClass}`}>{badge}</span>
        </div>

        <div className="listing-card-info">
          <h3 className="listing-card-name">{listing.name}</h3>
          <div className="listing-card-info-grid">
            {!listing.isFirm && !listing.isNonprofit && listing.firm && (
              <div className="listing-card-meta-item">
                <span className="listing-card-icon">🏢</span>
                <p className="listing-card-firm">{listing.firm}</p>
              </div>
            )}
            {location && (
              <div className="listing-card-meta-item">
                <span className="listing-card-icon">📍</span>
                <span className="listing-card-location">{location}</span>
              </div>
            )}
            {listing.additionalStates.length > 0 && (
              <div className="listing-card-meta-item">
                <span className="listing-card-icon">🗺️</span>
                <p className="listing-card-additional-states">
                  Also serves: {listing.additionalStates.map(s => STATE_NAMES[s] ?? s).join(", ")}
                </p>
              </div>
            )}
            {specialties.length > 0 && (
              <div className="listing-card-meta-item">
                <span className="listing-card-icon">⚖️</span>
                <p className="listing-card-specialties">{specialties.join(" · ")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {bioPreview && (
        <p className="listing-card-bio">
          {bioPreview.length === 220 ? bioPreview + "..." : bioPreview}
          <span className="listing-card-read-more"> Read More →</span>
        </p>
      )}
    </Link>
  )
}
