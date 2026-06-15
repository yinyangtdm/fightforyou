export type ParsedAddress = {
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
}

export function parseAddress(input: string): ParsedAddress | null {
  const s = input.trim()
  if (!s) return null

  const z = s.match(/^(.+)\s+([^,]+),\s*([A-Za-z]{2}),\s*(\d{5}(-\d{4})?)$/)
  if (z) {
    return {
      streetAddress: z[1].trim(),
      city: z[2].trim(),
      state: z[3].toUpperCase(),
      zipCode: z[4],
    }
  }

  const a = s.match(/^(.+),\s*(.+),\s*([A-Za-z]{2})\s+(\d{5}(-\d{4})?)$/)
  if (a) {
    return {
      streetAddress: a[1].trim(),
      city: a[2].trim(),
      state: a[3].toUpperCase(),
      zipCode: a[4],
    }
  }

  const b = s.match(/^(.+),\s*(.+?)\s+([A-Za-z]{2})\s+(\d{5}(-\d{4})?)$/)
  if (b) {
    return {
      streetAddress: b[1].trim(),
      city: b[2].trim(),
      state: b[3].toUpperCase(),
      zipCode: b[4],
    }
  }

  const c = s.match(/\b(\d{5}(-\d{4})?)\s*$/)
  if (c) return { zipCode: c[1] }

  return null
}

export async function lookupByZip(
  zip: string,
  timeoutMs = 4000
): Promise<{ city: string; state: string } | null> {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`, {
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) return null
    const data = (await res.json()) as {
      places?: Array<{ "place name": string; "state abbreviation": string }>
    }
    const place = data.places?.[0]
    if (!place) return null
    return { city: place["place name"], state: place["state abbreviation"] }
  } catch {
    return null
  }
}

export async function geocodeAddress(
  streetAddress: string,
  city: string,
  state: string,
  zipCode: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const params = new URLSearchParams({
      street: streetAddress,
      city,
      state,
      zip: zipCode,
      benchmark: "2020",
      format: "json",
    })
    const res = await fetch(
      `https://geocoding.geo.census.gov/geocoder/locations/address?${params}`
    )
    if (!res.ok) return null
    const json = (await res.json()) as {
      result?: { addressMatches?: Array<{ coordinates: { x: number; y: number } }> }
    }
    const match = json.result?.addressMatches?.[0]
    if (!match) return null
    return { latitude: match.coordinates.y, longitude: match.coordinates.x }
  } catch {
    return null
  }
}
