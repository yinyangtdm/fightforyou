"use client"

import { useState } from "react"

export default function LeadCheckbox({
  leadId,
  field,
  initialValue,
}: {
  leadId: number
  field: "contacted" | "handedOver"
  initialValue: boolean
}) {
  const [checked, setChecked] = useState(initialValue)
  const [saving, setSaving] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.checked
    setSaving(true)
    setChecked(value)
    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    })
    setSaving(false)
  }

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={handleChange}
      disabled={saving}
      className="w-4 h-4 accent-[#88c0d0] cursor-pointer disabled:cursor-wait"
    />
  )
}
