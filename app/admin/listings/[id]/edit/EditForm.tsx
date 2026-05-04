"use client"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Listing } from "@prisma/client"

interface FormState {
  isFirm: boolean
  name: string
  slug: string
  firm: string
  tagline: string
  email: string
  phone: string
  description: string
  photoUrl: string
  streetAddress: string
  city: string
  state: string
  zipCode: string
  isNational: boolean
  specialties: string
  notableResults: string[]
  keyCharacteristics: string[]
  barNumber: string
  website: string
  linkedin: string
  facebook: string
  approved: boolean
  featured: boolean
  isNonprofit: boolean
}

function generateSlug(name: string): string {
  let s = name.trim()
  s = s.replace(/^(Mr|Mrs|Ms|Dr|Prof)\.?\s+/i, "")
  s = s.replace(/[,\s]+(Jr|Sr|II|III|IV|V)\.?$/i, "")
  s = s.replace(/,?\s*(PLLC|APLC|CHTD|CORP|LLP|LLC|APC|PLC|LTD|INC|PSC|PA|PC|PL|SC|LP)\.?$/i, "")
  s = s.replace(/[+,]/g, "")
  s = s.replace(/\band\b/gi, "")
  s = s.replace(/&/g, " and ")
  s = s.replace(/[\d.]/g, "")
  s = s.toLowerCase().replace(/\s+/g, "-")
  s = s.replace(/-+/g, "-").replace(/^-+|-+$/g, "")
  return s
}

function splitIntoItems(raw: string): string[] {
  const trimmed = raw.trim()
  if (trimmed.includes('","')) {
    const items = trimmed.replace(/^"|"$/g, "").split('","').map(s => s.trim()).filter(Boolean)
    if (items.length) return items
  }
  const results: string[] = []
  for (const line of raw.split(/\r?\n/)) {
    const content = line.trim().replace(/^([-*]|\d+[.)]) */, "")
    if (!content) continue
    const sentences = content.replace(/([.!?]) +(?=[A-Z0-9])/g, "$1\x00").split("\x00")
    for (const s of sentences) {
      const t = s.trim()
      if (t) results.push(t)
    }
  }
  return results.length ? results : [""]
}

function parseAddress(input: string): { streetAddress?: string; city?: string; state?: string; zipCode?: string } | null {
  const s = input.trim()
  if (!s) return null
  // "street city, ST, zip" (no comma before state, comma after state)
  const z = s.match(/^(.+)\s+([^,]+),\s*([A-Za-z]{2}),\s*(\d{5}(-\d{4})?)$/)
  if (z) return { streetAddress: z[1].trim(), city: z[2].trim(), state: z[3].toUpperCase(), zipCode: z[4] }
  // "street, city, ST zip"
  const a = s.match(/^(.+),\s*(.+),\s*([A-Za-z]{2})\s+(\d{5}(-\d{4})?)$/)
  if (a) return { streetAddress: a[1].trim(), city: a[2].trim(), state: a[3].toUpperCase(), zipCode: a[4] }
  // "street, city ST zip" (no comma before state)
  const b = s.match(/^(.+),\s*(.+?)\s+([A-Za-z]{2})\s+(\d{5}(-\d{4})?)$/)
  if (b) return { streetAddress: b[1].trim(), city: b[2].trim(), state: b[3].toUpperCase(), zipCode: b[4] }
  // zip only / partial — extract what's there
  const c = s.match(/\b(\d{5}(-\d{4})?)\s*$/)
  if (c) return { zipCode: c[1] }
  return null
}

async function lookupByZip(zip: string): Promise<{ city: string; state: string } | null> {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`)
    if (!res.ok) return null
    const data = await res.json() as { places?: Array<{ "place name": string; "state abbreviation": string }> }
    const place = data.places?.[0]
    if (!place) return null
    return { city: place["place name"], state: place["state abbreviation"] }
  } catch {
    return null
  }
}

async function uploadFile(file: File): Promise<string> {
  const data = new FormData()
  data.append("file", file)
  const res = await fetch("/api/upload", { method: "POST", body: data })
  const result = await res.json() as { url?: string; error?: string }
  if (!res.ok) throw new Error(result.error ?? "Upload failed")
  return result.url!
}

interface EditFormProps {
  listing: Listing
}

export default function EditForm({ listing }: EditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [websiteError, setWebsiteError] = useState("")
  const [zipCodeError, setZipCodeError] = useState("")
  const [linkedinError, setLinkedinError] = useState("")
  const [facebookError, setFacebookError] = useState("")
  const [photoUploading, setPhotoUploading] = useState(false)
  const [addressInput, setAddressInput] = useState("")
  const [pageText, setPageText] = useState("")
  const [autoFillLoading, setAutoFillLoading] = useState(false)
  const [copyConfirm, setCopyConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const COPY_PROMPT = "Full official firm name. A 3-6 word descriptive nickname-style tagline. Email address. Phone number. 3-4 paragraph description focusing on history against police. Office address. Practice areas limited to civil rights, police misconduct, wrongful death, wrongful conviction, and other police-related fields. Notable results such as 7 figure settlements and verdicts against police. Key characteristics. Bar number. Website URL, LinkedIn, Facebook."

  function handleCopyPrompt() {
    void navigator.clipboard.writeText(COPY_PROMPT).then(() => {
      setCopyConfirm(true)
      setTimeout(() => setCopyConfirm(false), 2000)
    })
  }

  async function handleAutoFill() {
    if (!pageText.trim()) return
    setAutoFillLoading(true)
    try {
      const res = await fetch("/api/extract-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pageText }),
      })
      if (!res.ok) throw new Error("Auto-fill request failed")
      const data = await res.json() as {
        name?: string; firm?: string; isFirm?: boolean; isNonprofit?: boolean
        tagline?: string; email?: string; phone?: string; description?: string
        streetAddress?: string; city?: string; state?: string; zipCode?: string
        specialties?: string; notableResults?: string[]; keyCharacteristics?: string[]
        barNumber?: string; website?: string; linkedin?: string; facebook?: string
      }
      setForm(prev => ({
        ...prev,
        ...(data.name !== undefined && { name: data.name, slug: generateSlug(data.name) }),
        ...(data.firm !== undefined && { firm: data.firm }),
        ...(data.isFirm !== undefined && { isFirm: data.isFirm }),
        ...(data.isNonprofit !== undefined && { isNonprofit: data.isNonprofit }),
        ...(data.tagline !== undefined && { tagline: data.tagline }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: formatPhone(data.phone) }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.streetAddress !== undefined && { streetAddress: data.streetAddress }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.zipCode !== undefined && { zipCode: data.zipCode }),
        ...(data.specialties !== undefined && {
          specialties: prev.specialties && data.specialties
            ? prev.specialties + ", " + data.specialties
            : prev.specialties || data.specialties,
        }),
        ...(data.notableResults !== undefined && {
          notableResults: (() => {
            const merged = [...prev.notableResults.filter(s => s.trim()), ...data.notableResults]
            return merged.length ? merged : [""]
          })(),
        }),
        ...(data.keyCharacteristics !== undefined && {
          keyCharacteristics: (() => {
            const merged = [...prev.keyCharacteristics.filter(s => s.trim()), ...data.keyCharacteristics]
            return merged.length ? merged : [""]
          })(),
        }),
        ...(data.barNumber !== undefined && { barNumber: data.barNumber }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.linkedin !== undefined && { linkedin: data.linkedin }),
        ...(data.facebook !== undefined && { facebook: data.facebook }),
      }))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setAutoFillLoading(false)
    }
  }

  const [form, setForm] = useState<FormState>({
    isFirm: listing.isFirm ?? false,
    name: listing.name,
    slug: listing.slug,
    firm: listing.firm ?? "",
    tagline: listing.tagline ?? "",
    email: listing.email ?? "",
    phone: listing.phone ?? "",
    description: listing.description ?? "",
    photoUrl: listing.photoUrl ?? "",
    streetAddress: listing.streetAddress ?? "",
    city: listing.city ?? "",
    state: listing.state ?? "",
    zipCode: listing.zipCode ?? "",
    isNational: listing.isNational ?? false,
    specialties: (listing.specialties ?? []).join(", "),
    notableResults: listing.notableResults.length ? listing.notableResults : [""],
    keyCharacteristics: listing.keyCharacteristics.length ? listing.keyCharacteristics : [""],
    barNumber: listing.barNumber ?? "",
    website: listing.website ?? "",
    linkedin: listing.linkedin ?? "",
    facebook: listing.facebook ?? "",
    approved: listing.approved ?? false,
    featured: listing.featured ?? false,
    isNonprofit: listing.isNonprofit ?? false,
  })

  function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, "").replace(/^1+/, "").slice(0, 10)
    if (digits.length < 4) return digits.length ? `(${digits}` : ""
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    const checked = (e.target as HTMLInputElement).checked
    const type = e.target.type
    if (name === "name") {
      setForm(prev => ({ ...prev, name: value, slug: generateSlug(value) }))
      return
    }
    if (name === "phone") {
      setForm(prev => ({ ...prev, phone: formatPhone(value) }))
      return
    }
    if (name === "isFirm" && checked) {
      setForm(prev => ({ ...prev, isFirm: true, isNonprofit: false }))
      return
    }
    if (name === "isNonprofit" && checked) {
      setForm(prev => ({ ...prev, isNonprofit: true, isFirm: false }))
      return
    }
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  async function handleParseAddress(override?: string) {
    const parsed = parseAddress(override ?? addressInput)
    if (!parsed) return
    setForm(prev => ({
      ...prev,
      ...(parsed.streetAddress !== undefined && { streetAddress: parsed.streetAddress }),
      ...(parsed.city !== undefined && { city: parsed.city }),
      ...(parsed.state !== undefined && { state: parsed.state }),
      ...(parsed.zipCode !== undefined && { zipCode: parsed.zipCode }),
    }))
    if (parsed.zipCode) {
      setZipCodeError("")
      const result = await lookupByZip(parsed.zipCode.slice(0, 5))
      if (result) setForm(prev => ({ ...prev, city: result.city, state: result.state }))
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setPhotoUploading(true)
    uploadFile(file)
      .then(url => setForm(prev => ({ ...prev, photoUrl: url })))
      .catch(err => setError((err as Error).message))
      .finally(() => setPhotoUploading(false))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          specialties: form.specialties.split(",").map(s => s.trim()).filter(Boolean),
          notableResults: form.notableResults.filter(s => s.trim()),
          keyCharacteristics: form.keyCharacteristics.filter(s => s.trim()),
        }),
      })
      if (!res.ok) throw new Error("Failed to update listing")
      router.push("/admin/listings")
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="flex items-center gap-4 mb-6">
          <a href="/admin/listings" className="text-gray-500 hover:text-gray-700 text-sm">
            &larr; Back
          </a>
          <h1 className="text-2xl font-bold">Edit Listing</h1>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              value={pageText}
              onChange={e => setPageText(e.target.value)}
              rows={4}
              placeholder="Paste lawyer bio page text here to auto-fill..."
              className="w-full border rounded p-2 text-sm"
            />
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => void handleAutoFill()}
                disabled={autoFillLoading || !pageText.trim()}
                className="px-4 py-2 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {autoFillLoading ? "Filling..." : "Auto-fill"}
              </button>
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
              >
                {copyConfirm ? "Copied!" : "Copy prompt"}
              </button>
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isFirm" checked={form.isFirm} onChange={handleChange} />
              <span>Firm</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isNonprofit" checked={form.isNonprofit} onChange={handleChange} />
              <span>Nonprofit</span>
            </label>
          </div>
          {!form.isFirm && !form.isNonprofit && (
            <div>
              <label className="block text-sm font-medium mb-1">Firm Name</label>
              <input name="firm" value={form.firm} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input required name="name" value={form.name} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input readOnly name="slug" value={form.slug} className="w-full border rounded p-2 bg-gray-50 text-gray-500 cursor-default" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tagline</label>
            <input name="tagline" value={form.tagline} onChange={handleChange} className="w-full border rounded p-2" placeholder="e.g. The National Catalyst" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={() => {
                if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
                  setEmailError("Please enter a valid email address.")
                } else {
                  setEmailError("")
                }
              }}
              className={`w-full border rounded p-2 ${emailError ? "border-red-500" : ""}`}
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onBlur={() => {
                const digits = form.phone.replace(/\D/g, "")
                if (digits && digits.length < 10) {
                  setPhoneError("Please enter a complete 10-digit phone number.")
                } else {
                  setPhoneError("")
                }
              }}
              className={`w-full border rounded p-2 ${phoneError ? "border-red-500" : ""}`}
            />
            {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Photo</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoUploading}
              className="px-4 py-2 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {photoUploading ? "Uploading..." : "Upload Photo"}
            </button>
            {form.photoUrl && (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.photoUrl} alt="Preview" className="h-16 w-16 rounded object-cover" />
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, photoUrl: "" }))}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Full Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={addressInput}
                onChange={e => setAddressInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); void handleParseAddress() } }}
                onPaste={e => {
                  e.preventDefault()
                  const text = e.clipboardData.getData("text")
                  setAddressInput(text)
                  void handleParseAddress(text)
                }}
                placeholder="e.g. 123 Main St, Los Angeles, CA 90001"
                className="flex-1 border rounded p-2"
              />
              <button
                type="button"
                onClick={() => void handleParseAddress()}
                className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
              >
                Parse
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Street Address</label>
            <input name="streetAddress" value={form.streetAddress} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input readOnly name="city" value={form.city} className="w-full border rounded p-2 bg-gray-50 text-gray-500 cursor-default" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input readOnly name="state" value={form.state} className="w-full border rounded p-2 bg-gray-50 text-gray-500 cursor-default" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Zip Code</label>
              <input
                name="zipCode"
                value={form.zipCode}
                onChange={handleChange}
                onBlur={async () => {
                  if (!form.zipCode) { setZipCodeError(""); return }
                  if (!/^\d{5}(-\d{4})?$/.test(form.zipCode)) {
                    setZipCodeError("Please enter a valid zip code (e.g. 12345 or 12345-6789).")
                  } else {
                    setZipCodeError("")
                    const result = await lookupByZip(form.zipCode.slice(0, 5))
                    if (result) setForm(prev => ({ ...prev, city: result.city, state: result.state }))
                  }
                }}
                className={`w-full border rounded p-2 ${zipCodeError ? "border-red-500" : ""}`}
              />
              {zipCodeError && <p className="text-red-500 text-sm mt-1">{zipCodeError}</p>}
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isNational" checked={form.isNational} onChange={handleChange} />
            <span>National (operates across the US, not region-specific)</span>
          </label>
          <div>
            <label className="block text-sm font-medium mb-1">Specialties</label>
            <input name="specialties" value={form.specialties} onChange={handleChange} className="w-full border rounded p-2" placeholder="e.g. Criminal, Family, Immigration" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notable Results</label>
            <div className="space-y-2">
              {form.notableResults.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={item}
                    onChange={e => setForm(prev => ({ ...prev, notableResults: prev.notableResults.map((r, j) => j === i ? e.target.value : r) }))}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        setForm(prev => {
                          const arr = [...prev.notableResults]
                          arr.splice(i + 1, 0, "")
                          return { ...prev, notableResults: arr }
                        })
                      }
                    }}
                    className="flex-1 border rounded p-2"
                    placeholder="e.g. Won $2M settlement for client"
                  />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({
                      ...prev,
                      notableResults: prev.notableResults.length === 1 ? [""] : prev.notableResults.filter((_, j) => j !== i),
                    }))}
                    className="text-gray-400 hover:text-red-600 px-2 text-xl leading-none"
                    aria-label="Remove item"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, notableResults: [...prev.notableResults, ""] }))}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Item
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Key Characteristics</label>
            <div className="space-y-2">
              {form.keyCharacteristics.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={item}
                    onChange={e => setForm(prev => ({ ...prev, keyCharacteristics: prev.keyCharacteristics.map((r, j) => j === i ? e.target.value : r) }))}
                    onPaste={e => {
                      const items = splitIntoItems(e.clipboardData.getData("text"))
                      if (items.length <= 1) return
                      e.preventDefault()
                      setForm(prev => {
                        const arr = [...prev.keyCharacteristics]
                        arr.splice(i, 1, ...items)
                        return { ...prev, keyCharacteristics: arr }
                      })
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        setForm(prev => {
                          const arr = [...prev.keyCharacteristics]
                          arr.splice(i + 1, 0, "")
                          return { ...prev, keyCharacteristics: arr }
                        })
                      }
                    }}
                    className="flex-1 border rounded p-2"
                    placeholder="e.g. Bilingual (Spanish/English)"
                  />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({
                      ...prev,
                      keyCharacteristics: prev.keyCharacteristics.length === 1 ? [""] : prev.keyCharacteristics.filter((_, j) => j !== i),
                    }))}
                    className="text-gray-400 hover:text-red-600 px-2 text-xl leading-none"
                    aria-label="Remove item"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, keyCharacteristics: [...prev.keyCharacteristics, ""] }))}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Item
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bar Number</label>
            <input name="barNumber" value={form.barNumber} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Website URL</label>
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              onBlur={() => {
                if (!form.website) { setWebsiteError(""); return }
                const formatted = /^https?:\/\//i.test(form.website)
                  ? form.website
                  : "https://" + form.website
                setForm(prev => ({ ...prev, website: formatted }))
                try { new URL(formatted); setWebsiteError("") }
                catch { setWebsiteError("Please enter a valid website URL.") }
              }}
              className={`w-full border rounded p-2 ${websiteError ? "border-red-500" : ""}`}
            />
            {websiteError && <p className="text-red-500 text-sm mt-1">{websiteError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">LinkedIn</label>
            <input
              name="linkedin"
              value={form.linkedin}
              onChange={handleChange}
              onBlur={() => {
                if (!form.linkedin) { setLinkedinError(""); return }
                const formatted = /^https?:\/\//i.test(form.linkedin) ? form.linkedin : "https://" + form.linkedin
                setForm(prev => ({ ...prev, linkedin: formatted }))
                try {
                  const url = new URL(formatted)
                  if (!url.hostname.replace(/^www\./, "").startsWith("linkedin.com")) {
                    setLinkedinError("Please enter a valid LinkedIn URL.")
                  } else {
                    setLinkedinError("")
                  }
                } catch {
                  setLinkedinError("Please enter a valid LinkedIn URL.")
                }
              }}
              className={`w-full border rounded p-2 ${linkedinError ? "border-red-500" : ""}`}
            />
            {linkedinError && <p className="text-red-500 text-sm mt-1">{linkedinError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Facebook</label>
            <input
              name="facebook"
              value={form.facebook}
              onChange={handleChange}
              onBlur={() => {
                if (!form.facebook) { setFacebookError(""); return }
                const formatted = /^https?:\/\//i.test(form.facebook) ? form.facebook : "https://" + form.facebook
                setForm(prev => ({ ...prev, facebook: formatted }))
                try {
                  const url = new URL(formatted)
                  if (!url.hostname.replace(/^www\./, "").startsWith("facebook.com")) {
                    setFacebookError("Please enter a valid Facebook URL.")
                  } else {
                    setFacebookError("")
                  }
                } catch {
                  setFacebookError("Please enter a valid Facebook URL.")
                }
              }}
              className={`w-full border rounded p-2 ${facebookError ? "border-red-500" : ""}`}
            />
            {facebookError && <p className="text-red-500 text-sm mt-1">{facebookError}</p>}
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="approved" checked={form.approved} onChange={handleChange} />
            <span>Approved (visible on site)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
            <span>Featured</span>
          </label>
          <button type="submit" disabled={loading} className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  )
}
