import Link from "next/link"
import Image from "next/image"
import { Building2, MapPin, Briefcase } from "lucide-react"

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
  isNational: boolean
  specialties: string[]
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const location = [listing.city, listing.state]
    .filter(Boolean)
    .join(", ")

  const specialties = [...new Set(listing.specialties)].sort((a, b) => a.localeCompare(b))

  const badge = listing.isNonprofit
    ? "Nonprofit"
    : listing.isFirm
    ? "Law Firm"
    : "Attorney"

  const bioPreview = listing.description
    ? listing.description.substring(0, 220)
    : null

  return (
    <Link href={`/lawyers/${listing.slug}`} className="listing-card">
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
        <span className="listing-card-badge">{badge}</span>
      </div>
      <div className="listing-card-body">
        <h3 className="listing-card-name">{listing.name}</h3>
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
        {specialties.length > 0 && (
          <div className="listing-card-meta-item">
            <span className="listing-card-icon">⚖️</span>
            <p className="listing-card-specialties">{specialties.join(" · ")}</p>
          </div>
        )}
        {bioPreview && (
          <p className="listing-card-bio">
            {bioPreview.length === 220 ? bioPreview + "..." : bioPreview}
            <span className="listing-card-read-more"> Read More →</span>
          </p>
        )}
      </div>
    </Link>
  )
}
