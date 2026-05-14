"use client"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import CategoryPicker from "../../../../components/CategoryPicker"
import { Guide } from "@prisma/client"
import { specialtyDescriptions } from "../../../../lib/specialty-descriptions"
import { STATE_NAMES } from "../../../../lib/slugs"

const ALL_CATEGORY_OPTIONS: string[] = [
  "General",
  "Other",
  ...Object.keys(specialtyDescriptions),
  ...Object.values(STATE_NAMES),
]

function detectCategories(body: string): string[] {
  const lower = body.toLowerCase()
  return ALL_CATEGORY_OPTIONS.filter(opt => lower.includes(opt.toLowerCase()))
}

function generateSlug(title: string): string {
  let s = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
  if (s.length > 60) {
    s = s.slice(0, 60).replace(/-[^-]*$/, "")
  }
  return s
}

interface FormState {
  title: string
  slug: string
  excerpt: string
  body: string
  categories: string[]
  coverImageUrl: string
  authorName: string
  authorSlug: string
  published: boolean
  featured: boolean
}

export default function EditGuideForm({ guide }: { guide: Guide }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [coverUploading, setCoverUploading] = useState(false)
  const [bodyUploading, setBodyUploading] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const bodyImageInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>({
    title: guide.title,
    slug: guide.slug,
    excerpt: guide.excerpt ?? "",
    body: guide.body,
    categories: guide.categories,
    coverImageUrl: guide.coverImageUrl ?? "",
    authorName: guide.authorName ?? "",
    authorSlug: guide.authorSlug ?? "",
    published: guide.published,
    featured: guide.featured,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    const checked = (e.target as HTMLInputElement).checked
    const type = e.target.type
    if (name === "title") {
      setForm(prev => ({ ...prev, title: value, slug: generateSlug(value) }))
      return
    }
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("type", "guide")
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      setForm(prev => ({ ...prev, coverImageUrl: data.url }))
    } finally {
      setCoverUploading(false)
    }
  }

  async function handleBodyImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBodyUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("type", "guide")
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      const textarea = bodyRef.current
      if (!textarea) return
      const start = textarea.selectionStart ?? textarea.value.length
      const before = textarea.value.slice(0, start)
      const after = textarea.value.slice(start)
      const insertion = `![image](${data.url})`
      const newBody = before + insertion + after
      setForm(prev => ({ ...prev, body: newBody }))
      setTimeout(() => {
        textarea.focus()
        textarea.selectionStart = textarea.selectionEnd = start + insertion.length
      }, 0)
    } finally {
      setBodyUploading(false)
      if (bodyImageInputRef.current) bodyImageInputRef.current.value = ""
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/guides/${guide.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed to save guide")
      router.push("/admin/guides")
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
          <Link href="/admin/guides" className="text-gray-500 hover:text-black text-sm">← Guides</Link>
          <h1 className="text-2xl font-bold">Edit Guide</h1>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input required name="title" value={form.title} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange} className="w-full border rounded p-2 font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categories</label>
            <CategoryPicker
              value={form.categories}
              onChange={cats => setForm(prev => ({ ...prev, categories: cats }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cover Image</label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="w-full border rounded p-2"
            />
            {coverUploading && <p className="text-sm text-gray-500 mt-1">Uploading…</p>}
            {form.coverImageUrl && (
              <div className="mt-2 relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.coverImageUrl} alt="Cover" className="h-32 rounded border object-cover" />
                <button
                  type="button"
                  onClick={() => { setForm(prev => ({ ...prev, coverImageUrl: "" })); if (coverInputRef.current) coverInputRef.current.value = "" }}
                  className="absolute top-1 right-1 bg-black text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                >×</button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Excerpt</label>
            <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2} className="w-full border rounded p-2" placeholder="Short summary shown in listings" maxLength={161} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Body *</label>
              <div>
                <input
                  ref={bodyImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBodyImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bodyImageInputRef.current?.click()}
                  disabled={bodyUploading}
                  className="text-xs border rounded px-2 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  {bodyUploading ? "Uploading…" : "Insert Image"}
                </button>
              </div>
            </div>
            <textarea ref={bodyRef} required name="body" value={form.body} onChange={handleChange} rows={16} className="w-full border rounded p-2 font-mono text-sm" />
            {(() => {
              const suggestions = detectCategories(form.body).filter(c => !form.categories.includes(c))
              if (!suggestions.length) return null
              return (
                <div className="mt-2 flex flex-wrap gap-1 items-center">
                  <span className="text-xs text-gray-400 mr-1">Detected:</span>
                  {suggestions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, categories: [...prev.categories, s] }))}
                      className="text-xs border border-blue-300 text-blue-600 rounded px-2 py-0.5 hover:bg-blue-50"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              )
            })()}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Author Name</label>
            <input name="authorName" value={form.authorName} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Author Slug</label>
            <input name="authorSlug" value={form.authorSlug} onChange={handleChange} className="w-full border rounded p-2" placeholder="links to a listing" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="published" checked={form.published} onChange={handleChange} />
            <span>Published (visible on site)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
            <span>Featured</span>
          </label>
          <button type="submit" disabled={loading} className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50">
            {loading ? "Saving..." : "Save Guide"}
          </button>
        </form>
      </div>
    </div>
  )
}
