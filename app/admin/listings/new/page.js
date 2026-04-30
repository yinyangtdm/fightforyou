"use client"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

function generateSlug(name) {
  let s = name.trim()
  s = s.replace(/^(Mr|Mrs|Ms|Dr|Prof)\.?\s+/i, "")
  s = s.replace(/[,\s]+(Jr|Sr|II|III|IV|V)\.?$/i, "")
  s = s.replace(/[+&,]/g, "")
  s = s.replace(/\band\b/gi, "")
  s = s.replace(/[\d.]/g, "")
  s = s.toLowerCase().replace(/\s+/g, "-")
  s = s.replace(/-+/g, "-").replace(/^-+|-+$/g, "")
  return s
}

async function uploadFile(file) {
  const data = new FormData()
  data.append("file", file)
  const res = await fetch("/api/upload", { method: "POST", body: data })
  const result = await res.json()
  if (!res.ok) throw new Error(result.error || "Upload failed")
  return result.url
}

export default function NewListingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [photoUploading, setPhotoUploading] = useState(false)
  const [websiteUrlError, setWebsiteUrlError] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const [batch, setBatch] = useState(null)
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    isFirm: false,
    name: "",
    slug: "",
    email: "",
    phone: "",
    bio: "",
    photoUrl: "",
    city: "",
    state: "",
    zipCode: "",
    practiceAreas: "",
    notableResults: "",
    keyCharacteristics: "",
    barNumber: "",
    websiteUrl: "",
    linkedin: "",
    facebook: "",
    approved: false,
  })

  function formatPhone(value) {
    const digits = value.replace(/\D/g, "").replace(/^1+/, "").slice(0, 10)
    if (digits.length < 4) return digits.length ? `(${digits}` : ""
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    if (name === "name") {
      setForm(prev => ({ ...prev, name: value, slug: generateSlug(value) }))
      return
    }
    if (name === "phone") {
      setForm(prev => ({ ...prev, phone: formatPhone(value) }))
      return
    }
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  async function handleSingleUpload(file) {
    setPhotoUploading(true)
    try {
      const url = await uploadFile(file)
      setForm(prev => ({ ...prev, photoUrl: url }))
    } catch (err) {
      setError(err.message)
    } finally {
      setPhotoUploading(false)
    }
  }

  async function startBatchUpload(files) {
    const initialItems = files.map(file => ({
      filename: file.name,
      slug: generateSlug(file.name.replace(/\.[^.]+$/, "")),
      url: null,
      listingId: null,
      listingName: null,
      skip: false,
      error: null,
    }))

    setBatch({ status: "processing", items: initialItems })

    const [listingsResult, ...uploadResults] = await Promise.all([
      fetch("/api/listings")
        .then(r => r.json())
        .catch(() => []),
      ...files.map(file =>
        uploadFile(file)
          .then(url => ({ url, error: null }))
          .catch(err => ({ url: null, error: err.message }))
      ),
    ])

    const listings = Array.isArray(listingsResult) ? listingsResult : []

    setBatch({
      status: "preview",
      items: initialItems.map((item, i) => {
        const { url, error } = uploadResults[i]
        const match = listings.find(l => l.slug === item.slug)
        return {
          ...item,
          url,
          error,
          listingId: match?.id ?? null,
          listingName: match?.name ?? null,
          skip: !match,
        }
      }),
    })
  }

  function handleFileSelect(e) {
    const files = Array.from(e.target.files)
    e.target.value = ""
    if (files.length === 1) handleSingleUpload(files[0])
    else if (files.length > 1) startBatchUpload(files)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"))
    if (files.length === 1) handleSingleUpload(files[0])
    else if (files.length > 1) startBatchUpload(files)
  }

  async function handleBatchConfirm() {
    setBatch(prev => ({ ...prev, status: "saving" }))
    const toUpdate = batch.items.filter(item => item.listingId && !item.skip && item.url && !item.error)
    await Promise.all(
      toUpdate.map(item =>
        fetch(`/api/listings/${item.listingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoUrl: item.url }),
        })
      )
    )
    setBatch(prev => ({ ...prev, status: "done" }))
  }

  function toggleBatchSkip(index, checked) {
    setBatch(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, skip: checked } : item),
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed to create listing")
      router.push("/admin/listings")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const confirmCount = batch
    ? batch.items.filter(item => item.listingId && !item.skip && item.url && !item.error).length
    : 0

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6">Add New Listing</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isFirm" checked={form.isFirm} onChange={handleChange} />
              <span>This is a firm (not an individual lawyer)</span>
            </label>
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input required name="name" value={form.name} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug * (URL-friendly name e.g. john-smith)</label>
              <input readOnly name="slug" value={form.slug} className="w-full border rounded p-2 bg-gray-50 text-gray-500 cursor-default" />
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
              <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Photo</label>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors select-none ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
              >
                {photoUploading ? (
                  <span className="text-gray-500">Uploading...</span>
                ) : (
                  <>
                    <span className="text-gray-600">Drop photo here or <span className="text-blue-600">click to select</span></span>
                    <br />
                    <span className="text-xs text-gray-400">Drop multiple files to bulk-assign photos to existing listings</span>
                  </>
                )}
              </div>
              {form.photoUrl && (
                <div className="mt-2 flex items-center gap-3">
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input name="city" value={form.city} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input name="state" value={form.state} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Zip Code</label>
                <input name="zipCode" value={form.zipCode} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Practice Areas</label>
              <input name="practiceAreas" value={form.practiceAreas} onChange={handleChange} className="w-full border rounded p-2" placeholder="e.g. Criminal, Family, Immigration" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notable Results</label>
              <textarea name="notableResults" value={form.notableResults} onChange={handleChange} rows={3} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Key Characteristics</label>
              <textarea name="keyCharacteristics" value={form.keyCharacteristics} onChange={handleChange} rows={3} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bar Number</label>
              <input name="barNumber" value={form.barNumber} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website URL</label>
              <input
                name="websiteUrl"
                value={form.websiteUrl}
                onChange={handleChange}
                onBlur={() => {
                  if (!form.websiteUrl) { setWebsiteUrlError(""); return }
                  const formatted = /^https?:\/\//i.test(form.websiteUrl)
                    ? form.websiteUrl
                    : "https://" + form.websiteUrl
                  setForm(prev => ({ ...prev, websiteUrl: formatted }))
                  try { new URL(formatted); setWebsiteUrlError("") }
                  catch { setWebsiteUrlError("Please enter a valid website URL.") }
                }}
                className={`w-full border rounded p-2 ${websiteUrlError ? "border-red-500" : ""}`}
              />
              {websiteUrlError && <p className="text-red-500 text-sm mt-1">{websiteUrlError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">LinkedIn</label>
              <input name="linkedin" value={form.linkedin} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Facebook</label>
              <input name="facebook" value={form.facebook} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="approved" checked={form.approved} onChange={handleChange} />
              <span>Approved (visible on site)</span>
            </label>
            <button type="submit" disabled={loading} className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50">
              {loading ? "Saving..." : "Add Listing"}
            </button>
          </form>
        </div>
      </div>

      {batch && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold">Bulk Photo Upload</h2>
              {batch.status !== "saving" && (
                <button
                  onClick={() => setBatch(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="p-6">
              {batch.status === "processing" && (
                <div className="text-center py-12 text-gray-500">
                  Uploading {batch.items.length} photo{batch.items.length !== 1 ? "s" : ""} to Cloudinary...
                </div>
              )}

              {batch.status !== "processing" && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-3 py-2 font-medium">Filename</th>
                      <th className="px-3 py-2 font-medium">Generated Slug</th>
                      <th className="px-3 py-2 font-medium">Matched Listing</th>
                      <th className="px-3 py-2 font-medium">Preview</th>
                      <th className="px-3 py-2 font-medium text-center">Skip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {batch.items.map((item, i) => (
                      <tr key={i} className={item.skip ? "opacity-40" : ""}>
                        <td className="px-3 py-2 font-mono text-xs text-gray-600 max-w-[180px] truncate">{item.filename}</td>
                        <td className="px-3 py-2 font-mono text-xs text-gray-600">{item.slug}</td>
                        <td className="px-3 py-2">
                          {item.error ? (
                            <span className="text-red-500 text-xs">{item.error}</span>
                          ) : item.listingName ? (
                            <span className="text-green-700 font-medium">{item.listingName}</span>
                          ) : (
                            <span className="text-red-500">No match found</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {item.url && (
                            <img src={item.url} alt="" className="h-10 w-10 rounded object-cover" />
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={item.skip}
                            disabled={batch.status !== "preview"}
                            onChange={e => toggleBatchSkip(i, e.target.checked)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {batch.status === "done" && (
                <p className="text-green-600 font-medium mt-4 text-center">
                  Done — {confirmCount} listing{confirmCount !== 1 ? "s" : ""} updated.
                </p>
              )}
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              {batch.status === "preview" && (
                <>
                  <button onClick={() => setBatch(null)} className="px-4 py-2 border rounded hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    onClick={handleBatchConfirm}
                    disabled={confirmCount === 0}
                    className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                  >
                    Confirm ({confirmCount} update{confirmCount !== 1 ? "s" : ""})
                  </button>
                </>
              )}
              {batch.status === "saving" && (
                <span className="text-gray-500 py-2">Saving...</span>
              )}
              {batch.status === "done" && (
                <button onClick={() => setBatch(null)} className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
