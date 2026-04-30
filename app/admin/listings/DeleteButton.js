"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function DeleteButton({ id }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm("Delete this listing?")) return
    setLoading(true)
    try {
      await fetch(`/api/listings/${id}`, { method: "DELETE" })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  )
}
