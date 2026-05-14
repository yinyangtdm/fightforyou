"use client"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import CategoryPicker from "../../../components/CategoryPicker"
import { specialtyDescriptions } from "../../../lib/specialty-descriptions"
import { STATE_NAMES } from "../../../lib/slugs"

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

function insertMarkdown(
  textarea: HTMLTextAreaElement,
  before: string,
  after = "",
  placeholder = "text",
  onUpdate: (val: string) => void
) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = textarea.value.slice(start, end) || placeholder
  const newVal = textarea.value.slice(0, start) + before + selected + after + textarea.value.slice(end)
  onUpdate(newVal)
  setTimeout(() => {
    textarea.focus()
    const cursor = start + before.length + selected.length + after.length
    textarea.selectionStart = textarea.selectionEnd = cursor
  }, 0)
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

export default function NewGuidePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [coverUploading, setCoverUploading] = useState(false)
  const [bodyUploading, setBodyUploading] = useState(false)
  const [coverFileName, setCoverFileName] = useState("")
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const bodyImageInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>({
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    categories: [],
    coverImageUrl: "",
    authorName: "",
    authorSlug: "",
    published: false,
    featured: false,
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
    setCoverFileName(file.name)
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
      const res = await fetch("/api/guides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed to create guide")
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
          <h1 className="text-2xl font-bold">New Guide</h1>
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
                className="shrink-0 px-3 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 disabled:opacity-50"
              >
                {coverUploading ? "Uploading…" : "Browse"}
              </button>
              <input
                type="text"
                readOnly
                value={coverUploading ? "Uploading…" : coverFileName}
                placeholder="No file chosen"
                className="flex-1 border rounded p-2 text-sm text-gray-500 bg-gray-50 cursor-default"
              />
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
            </div>
            {form.coverImageUrl && (
              <div className="mt-2 relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.coverImageUrl} alt="Cover" className="h-32 rounded border object-cover" />
                <button
                  type="button"
                  onClick={() => { setForm(prev => ({ ...prev, coverImageUrl: "" })); setCoverFileName(""); if (coverInputRef.current) coverInputRef.current.value = "" }}
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
            <label className="block text-sm font-medium mb-1">Body *</label>
            <div className="flex flex-wrap gap-1 mb-1 p-1 border rounded bg-gray-50">
              {[
                { label: "B", title: "Bold", before: "**", after: "**", placeholder: "bold text" },
                { label: "I", title: "Italic", before: "*", after: "*", placeholder: "italic text" },
                { label: "H2", title: "Heading 2", before: "## ", after: "", placeholder: "Heading" },
                { label: "H3", title: "Heading 3", before: "### ", after: "", placeholder: "Heading" },
                { label: "UL", title: "Bullet list", before: "- ", after: "", placeholder: "List item" },
                { label: "OL", title: "Numbered list", before: "1. ", after: "", placeholder: "List item" },
                { label: "\"\"", title: "Blockquote", before: "> ", after: "", placeholder: "Quote" },
                { label: "—", title: "Divider", before: "\n\n---\n\n", after: "", placeholder: "" },
              ].map(btn => (
                <button
                  key={btn.label}
                  type="button"
                  title={btn.title}
                  onClick={() => bodyRef.current && insertMarkdown(bodyRef.current, btn.before, btn.after, btn.placeholder, val => setForm(prev => ({ ...prev, body: val })))}
                  className="text-xs border rounded px-2 py-1 font-mono font-bold text-gray-700 hover:bg-white hover:shadow-sm"
                >
                  {btn.label}
                </button>
              ))}
              <div className="w-px bg-gray-300 mx-1" />
              <input ref={bodyImageInputRef} type="file" accept="image/*" onChange={handleBodyImageUpload} className="hidden" />
              <button
                type="button"
                onClick={() => bodyImageInputRef.current?.click()}
                disabled={bodyUploading}
                className="text-xs border rounded px-2 py-1 text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-50"
              >
                {bodyUploading ? "Uploading…" : "🖼 Image"}
              </button>
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
            {loading ? "Saving..." : "Create Guide"}
          </button>
        </form>
      </div>
    </div>
  )
}
