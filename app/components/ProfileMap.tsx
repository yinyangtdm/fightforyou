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
        interactive: false,
      })

      new mapboxgl.Marker({ color: "#5E81AC" })
        .setLngLat([longitude, latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(name))
        .addTo(map as Parameters<mapboxgl.Marker["addTo"]>[0])

      mapRef.current = map
    }

    init()

    return () => {
      map?.remove()
      mapRef.current = null
    }
  }, [latitude, longitude, name])

  return <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: 400, borderRadius: 8 }} />
}
