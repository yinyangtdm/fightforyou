"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Listing } from "@prisma/client"

interface FormState {
  isFirm: boolean
  name: string
  slug: string
  email: string
  phone: string
  bio: string
  photoUrl: string
  city: string
  state: string
  zipCode: string
  practiceAreas: string
  notableResults: string
  keyCharacteristics: string
  barNumber: string
  websiteUrl: string
  linkedin: string
  facebook: string
  approved: boolean
}

interface EditFormProps {
  listing: Listing
}

export default function EditForm({ listing }: EditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [form, setForm] = useState<FormState>({
    isFirm: listing.isFirm,
    name: listing.name,
    slug: listing.slug,
    email: listing.email ?? "",
    phone: listing.phone ?? "",
    bio: listing.bio ?? "",
    photoUrl: listing.photoUrl ?? "",
    city: listing.city ?? "",
    state: listing.state ?? "",
    zipCode: listing.zipCode ?? "",
    practiceAreas: listing.practiceAreas ?? "",
    notableResults: listing.notableResults ?? "",
    keyCharacteristics: listing.keyCharacteristics ?? "",
    barNumber: listing.barNumber ?? "",
    websiteUrl: listing.websiteUrl ?? "",
    linkedin: listing.linkedin ?? "",
    facebook: listing.facebook ?? "",
    approved: listing.approved,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    const checked = (e.target as HTMLInputElement).checked
    const type = e.target.type
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isFirm" checked={form.isFirm} onChange={handleChange} />
            <span>This is a firm (not an individual lawyer)</span>
          </label>
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input required name="name" value={form.name} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug *</label>
            <input required name="slug" value={form.slug} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded p-2" />
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
            <label className="block text-sm font-medium mb-1">Photo URL</label>
            <input name="photoUrl" value={form.photoUrl} onChange={handleChange} className="w-full border rounded p-2" />
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
            <input name="websiteUrl" value={form.websiteUrl} onChange={handleChange} className="w-full border rounded p-2" />
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
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  )
}
