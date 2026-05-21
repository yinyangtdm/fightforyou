"use client"

import Link from "next/link"

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function track(slug: string, eventType: string, gaEvent: string) {
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, eventType }),
  })
  window.gtag?.("event", gaEvent, { attorney: slug })
}

export default function ProfileButtons({
  slug,
  phone,
  website,
}: {
  slug: string
  phone?: string | null
  website?: string | null
}) {
  return (
    <>
      {phone && (
        <a
          href={`tel:${phone}`}
          className="btn-primary"
          onClick={() => track(slug, "call", "phone_click")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          {phone}
        </a>
      )}

      <Link
        href={`/attorneys/${slug}/contact`}
        className="btn-primary"
        onClick={() => track(slug, "contact", "contact_click")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-10 5L2 7" />
        </svg>
        Send Message
      </Link>

      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary btn-website"
          onClick={() => track(slug, "website", "website_click")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Visit Website
        </a>
      )}
    </>
  )
}
