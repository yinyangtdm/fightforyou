"use client"

import { useEffect, useRef } from "react"
import "mapbox-gl/dist/mapbox-gl.css"

interface Props {
  latitude: number
  longitude: number
  name: string
}

export default function ProfileMap({ latitude, longitude, name }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)

  const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
  const appleUrl = `https://maps.apple.com/?ll=${latitude},${longitude}&q=${encodeURIComponent(name)}`

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let map: { remove: () => void } | null = null

    async function init() {
      const mapboxgl = (await import("mapbox-gl")).default

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

      map = new mapboxgl.Map({
        container: containerRef.current!,
        style: "mapbox://styles/yinyangthetwin/cmp5yuprb004p01shflez16hy",
        center: [longitude, latitude],
        zoom: 14,
        interactive: true,
      })

      const popupHtml = `<strong>${name}</strong><br/><a href="${googleUrl}" target="_blank" rel="noopener noreferrer">Google Maps</a> &middot; <a href="${appleUrl}" target="_blank" rel="noopener noreferrer">Apple Maps</a>`

      new mapboxgl.Marker({ color: "#5E81AC" })
        .setLngLat([longitude, latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml))
        .addTo(map as Parameters<mapboxgl.Marker["addTo"]>[0])

      mapRef.current = map
    }

    init()

    return () => {
      map?.remove()
      mapRef.current = null
    }
  }, [latitude, longitude, name, googleUrl, appleUrl])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: 400, borderRadius: 8 }} />
      <div className="profile-map-actions">
        <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="profile-map-directions-link">
          Get directions (Google Maps)
        </a>
        <a href={appleUrl} target="_blank" rel="noopener noreferrer" className="profile-map-directions-link">
          Get directions (Apple Maps)
        </a>
      </div>
    </div>
  )
}
