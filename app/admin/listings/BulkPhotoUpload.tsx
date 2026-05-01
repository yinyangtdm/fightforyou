"use client"
import { useState, useRef } from "react"

interface BatchItem {
  filename: string
  slug: string
  url: string | null
  listingId: number | null
  listingName: string | null
  skip: boolean
  error: string | null
}

interface BatchState {
  status: "processing" | "preview" | "saving" | "done"
  items: BatchItem[]
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

async function uploadFile(file: File): Promise<string> {
  const data = new FormData()
  data.append("file", file)
  const res = await fetch("/api/upload", { method: "POST", body: data })
  const result = await res.json() as { url?: string; error?: string }
  if (!res.ok) throw new Error(result.error ?? "Upload failed")
  return result.url!
}

export default function BulkPhotoUpload() {
  const [batch, setBatch] = useState<BatchState | null>(null)
  const [dragOver, setDragOver] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function startBatchUpload(files: File[]) {
    const initialItems: BatchItem[] = files.map(file => ({
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
        .then(r => r.json() as Promise<Array<{ id: number; name: string; slug: string }>>)
        .catch(() => [] as Array<{ id: number; name: string; slug: string }>),
      ...files.map(file =>
        uploadFile(file)
          .then(url => ({ url, error: null }))
          .catch((err: Error) => ({ url: null, error: err.message }))
      ),
    ])

    const listings = Array.isArray(listingsResult) ? listingsResult : []

    setBatch({
      status: "preview",
      items: initialItems.map((item, i) => {
        const { url, error } = uploadResults[i] as { url: string | null; error: string | null }
        const match = listings.find((l: { id: number; name: string; slug: string }) => l.slug === item.slug)
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

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter(f => f.type.startsWith("image/"))
    e.target.value = ""
    if (files.length > 0) startBatchUpload(files)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"))
    if (files.length > 0) startBatchUpload(files)
  }

  async function handleBatchConfirm() {
    setBatch(prev => prev ? { ...prev, status: "saving" } : prev)
    const toUpdate = batch!.items.filter(item => item.listingId && !item.skip && item.url && !item.error)
    await Promise.all(
      toUpdate.map(item =>
        fetch(`/api/listings/${item.listingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoUrl: item.url }),
        })
      )
    )
    setBatch(prev => prev ? { ...prev, status: "done" } : prev)
  }

  function toggleBatchSkip(index: number, checked: boolean) {
    setBatch(prev =>
      prev
        ? {
            ...prev,
            items: prev.items.map((item, i) => (i === index ? { ...item, skip: checked } : item)),
          }
        : prev
    )
  }

  const confirmCount = batch
    ? batch.items.filter(item => item.listingId && !item.skip && item.url && !item.error).length
    : 0

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`px-4 py-2 border-2 border-dashed rounded cursor-pointer text-sm select-none transition-colors ${dragOver ? "border-blue-400 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-600 hover:border-gray-400"}`}
      >
        Bulk Photo Upload
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
                            // eslint-disable-next-line @next/next/no-img-element
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
