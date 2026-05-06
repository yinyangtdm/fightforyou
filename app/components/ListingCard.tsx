import Link from "next/link"
import Image from "next/image"

type Listing = {
  slug: string
  name: string
  firm: string | null
  tagline: string | null
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
          <p className="listing-card-firm">{listing.firm}</p>
        )}
        {location && <span className="listing-card-location">{location}</span>}
        {specialties.length > 0 && (
          <p className="listing-card-specialties">{specialties.join(" · ")}</p>
        )}
      </div>
    </Link>
  )
}
