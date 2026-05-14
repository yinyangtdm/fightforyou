export function deriveExcerpt(body: string): string {
  for (const block of body.split(/\n\n+/)) {
    const t = block.trim()
    if (!t || t.startsWith("#") || t.startsWith("- ") || t.startsWith("![")) continue
    const text = t.replace(/[*_`]/g, "")
    if (text.length <= 200) return text
    const cut = text.slice(0, 200)
    const dot = cut.lastIndexOf(".")
    return dot > 100 ? cut.slice(0, dot + 1) : cut + "…"
  }
  return ""
}

export function categorySlug(cat: string): string {
  return cat.toLowerCase().replace(/\s+/g, "-")
}

export function categoryFromSlug(slug: string): string {
  return slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
}

export const PINNED_GUIDES = [
  {
    slug: "filing-deadlines-by-state",
    href: "/guides/filing-deadlines-by-state",
    title: "State Filing Deadlines",
    excerpt: "State-by-state statutes of limitations and notice-of-claim deadlines for civil rights cases. Missing a deadline permanently bars your claim.",
    authorName: "fightfor.you",
    date: "May 9, 2026",
    readLabel: "Look up your state →",
  },
  {
    slug: "qualified-immunity",
    href: "/guides/qualified-immunity",
    title: "Qualified Immunity Laws",
    excerpt: "How qualified immunity shields officers from personal liability, which states have reformed or abolished it, and what it means for your case.",
    authorName: "fightfor.you",
    date: "May 9, 2026",
    readLabel: "Look up your state →",
  },
  {
    slug: "glossary",
    href: "/guides/glossary",
    title: "Legal Glossary",
    excerpt: "Plain-language definitions of legal terms that come up in civil rights cases — from qualified immunity to Section 1983.",
    authorName: "fightfor.you",
    date: "May 14, 2026",
    readLabel: "Browse terms →",
  },
]
