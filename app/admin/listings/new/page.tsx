"use client"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

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
    const content = line.trim().replace(/^(?:[-•*·]|\d+[.)]) */, "")
    if (!content) continue
    for (const s of content.split(/(?<=[.!?]) +(?=[A-Z0-9])/)) {
      const t = s.trim()
      if (t) results.push(t)
    }
  }
  return results.length ? results : [""]
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

export default function NewListingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [emailError, setEmailError] = useState<string>("")
  const [phoneError, setPhoneError] = useState<string>("")
  const [photoUploading, setPhotoUploading] = useState<boolean>(false)
  const [websiteError, setWebsiteUrlError] = useState<string>("")
  const [zipCodeError, setZipCodeError] = useState<string>("")
  const [linkedinError, setLinkedinError] = useState<string>("")
  const [facebookError, setFacebookError] = useState<string>("")
  const [dragOver, setDragOver] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>({
    isFirm: false,
    name: "",
    slug: "",
    firm: "",
    tagline: "",
    email: "",
    phone: "",
    description: "",
    photoUrl: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    isNational: false,
    specialties: "",
    notableResults: [""],
    keyCharacteristics: [""],
    barNumber: "",
    website: "",
    linkedin: "",
    facebook: "",
    approved: false,
    featured: false,
    isNonprofit: false,
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

  async function handleSingleUpload(file: File) {
    setPhotoUploading(true)
    try {
      const url = await uploadFile(file)
      setForm(prev => ({ ...prev, photoUrl: url }))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setPhotoUploading(false)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (file) handleSingleUpload(file)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith("image/"))
    if (file) handleSingleUpload(file)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          specialties: form.specialties.split(',').map(s => s.trim()).filter(Boolean),
          notableResults: form.notableResults.filter(s => s.trim()),
          keyCharacteristics: form.keyCharacteristics.filter(s => s.trim()),
        }),
      })
      if (!res.ok) throw new Error("Failed to create listing")
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
          <h1 className="text-2xl font-bold mb-6">Add New Listing</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-sm font-medium mb-1">Slug * (URL-friendly name e.g. john-smith)</label>
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
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors select-none ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
              >
                {photoUploading ? (
                  <span className="text-gray-500">Uploading...</span>
                ) : (
                  <span className="text-gray-600">Drop photo here or <span className="text-blue-600">click to select</span></span>
                )}
              </div>
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
                  if (!form.website) { setWebsiteUrlError(""); return }
                  const formatted = /^https?:\/\//i.test(form.website)
                    ? form.website
                    : "https://" + form.website
                  setForm(prev => ({ ...prev, website: formatted }))
                  try { new URL(formatted); setWebsiteUrlError("") }
                  catch { setWebsiteUrlError("Please enter a valid website URL.") }
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
              {loading ? "Saving..." : "Add Listing"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
