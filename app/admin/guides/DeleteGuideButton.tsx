"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface DeleteGuideButtonProps {
  id: number
}

export default function DeleteGuideButton({ id }: DeleteGuideButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)

  async function handleDelete() {
    if (!confirm("Delete this guide?")) return
    setLoading(true)
    try {
      await fetch(`/api/guides/${id}`, { method: "DELETE" })
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
