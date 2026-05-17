"use client"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

interface Listing {
  id: number
  name: string
  slug: string
  photoUrl: string | null
}

interface FileEntry {
  file: File
  slug: string
  match: Listing | null
  preview: string
}

interface Props {
  listings: Listing[]
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

function filenameToSlug(filename: string): string {
  return generateSlug(filename.replace(/\.[^.]+$/, ""))
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j]
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1])
      prev = tmp
    }
  }
  return dp[n]
}

export default function BulkPhotoUpload({ listings }: Props) {
  const router = useRouter()
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<{ name: string; success: boolean; error?: string }[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function processFiles(files: File[]) {
    const imageFiles = files.filter(f => f.type.startsWith("image/"))
    setEntries(prev => {
      const existingNames = new Set(prev.map(e => e.file.name))
      const newEntries: FileEntry[] = imageFiles
        .filter(f => !existingNames.has(f.name))
        .map(file => {
          const slug = filenameToSlug(file.name)
          const exact = listings.find(l => l.slug === slug) ?? null
          let match = exact
          if (!match) {
            let bestDist = 5
            for (const l of listings) {
              const d = levenshtein(slug, l.slug)
              if (d < bestDist) { bestDist = d; match = l }
            }
          }
          return {
            file,
            slug,
            match,
            preview: URL.createObjectURL(file),
          }
        })
      return [...prev, ...newEntries]
    })
    setResults([])
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    processFiles(Array.from(e.dataTransfer.files))
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) processFiles(Array.from(e.target.files))
    e.target.value = ""
  }

  async function handleConfirm() {
    const matched = entries.filter(e => e.match !== null)
    if (matched.length === 0) return
    setUploading(true)
    setResults([])
    const uploadResults: { name: string; success: boolean; error?: string }[] = []
    for (const entry of matched) {
      try {
        const formData = new FormData()
        formData.append("file", entry.file)
        formData.append("publicId", entry.match!.slug)
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
        const uploadData = await uploadRes.json() as { url?: string; error?: string }
        if (!uploadRes.ok) throw new Error(uploadData.error ?? "Upload failed")
        const patchRes = await fetch(`/api/listings/${entry.match!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoUrl: uploadData.url }),
        })
        if (!patchRes.ok) throw new Error("Failed to update listing")
        uploadResults.push({ name: entry.match!.name, success: true })
      } catch (err) {
        uploadResults.push({ name: entry.match!.name, success: false, error: (err as Error).message })
      }
    }
    setResults(uploadResults)
    setUploading(false)
    setEntries([])
    router.refresh()
  }

  const matchedCount = entries.filter(e => e.match !== null).length

  return (
    <div className="bg-[#3b4252] rounded-lg border border-[#4c566a] p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4">Bulk Photo Upload</h2>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragging ? "border-[#88c0d0] bg-[#3b4252]" : "border-[#4c566a] hover:border-[#88c0d0]"
        }`}
      >
        <p className="text-[#9aa5b4] text-sm">Drag photos here or click to select</p>
        <p className="text-[#4c566a] text-xs mt-1">Filenames should match listing names (e.g. &quot;John Smith.jpg&quot;)</p>
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleInputChange} className="hidden" />
      </div>

      {entries.length > 0 && (
        <div className="mt-4">
          <div className="border border-[#4c566a] rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left text-[#eceff4]">
              <thead className="bg-[#434c5e] border-b border-[#4c566a]">
                <tr>
                  <th className="px-4 py-2 font-medium">Preview</th>
                  <th className="px-4 py-2 font-medium">Photo Slug</th>
                  <th className="px-4 py-2 font-medium">Listing Slug</th>
                  <th className="px-4 py-2 font-medium w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4c566a]">
                {entries.map((entry, i) => (
                  <tr key={entry.file.name} className="hover:bg-[#434c5e]">
                    <td className="px-4 py-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={entry.preview} alt="" className="h-10 w-10 object-cover rounded" />
                    </td>
                    <td className="px-4 py-2 font-mono text-[#d8dee9]">{entry.slug}</td>
                    <td className="px-4 py-2 font-mono">
                      {entry.match ? (
                        <>
                          <span>{entry.match.slug}</span>
                          {entry.match.photoUrl && (
                            <span className="block text-xs text-amber-600 font-sans mt-0.5">⚠ already has a photo</span>
                          )}
                        </>
                      ) : (
                        <span className="text-red-500">No match found</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => setEntries(prev => prev.filter((_, j) => j !== i))}
                        className="text-[#4c566a] hover:text-red-400 text-xl leading-none"
                        aria-label="Remove"
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={handleConfirm}
              disabled={uploading || matchedCount === 0}
              className="bg-[#5e81ac] text-white px-4 py-2 rounded text-sm hover:bg-[#81a1c1] disabled:opacity-50"
            >
              {uploading ? "Uploading..." : `Confirm Upload (${matchedCount} matched)`}
            </button>
            <button
              onClick={() => setEntries([])}
              disabled={uploading}
              className="text-sm text-[#9aa5b4] hover:text-[#eceff4]"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-4 space-y-1">
          {results.map((r, i) => (
            <p key={i} className={`text-sm ${r.success ? "text-green-600" : "text-red-600"}`}>
              {r.success ? `✓ ${r.name}` : `✗ ${r.name}: ${r.error}`}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
