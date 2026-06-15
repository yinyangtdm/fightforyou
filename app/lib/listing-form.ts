export function splitIntoItems(raw: string): string[] {
  const trimmed = raw.trim()
  if (trimmed.includes('","')) {
    const items = trimmed
      .replace(/^"|"$/g, "")
      .split('","')
      .map((s) => s.trim())
      .filter(Boolean)
    if (items.length) return items
  }

  const results: string[] = []
  for (const line of raw.split(/\r?\n/)) {
    const content = line.trim().replace(/^([-*]|\d+[.)]) */, "")
    if (!content) continue
    const sentences = content.replace(/([.!?]) +(?=[A-Z0-9])/g, "$1\x00").split("\x00")
    for (const s of sentences) {
      const t = s.trim()
      if (t) results.push(t)
    }
  }

  return results.length ? results : [""]
}
