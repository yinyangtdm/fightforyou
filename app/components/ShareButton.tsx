"use client"

import { useState } from "react"

export default function ShareButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url })
      } catch {}
      return
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      title={copied ? "Link copied!" : "Share profile"}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px",
        color: copied ? "var(--accent)" : "var(--text-muted)",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "13px",
        fontFamily: "var(--sans)",
        transition: "color 0.15s",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
      {copied ? "Copied!" : "Share"}
    </button>
  )
}
