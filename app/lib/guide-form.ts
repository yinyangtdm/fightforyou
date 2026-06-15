import { specialtyDescriptions } from "./specialty-descriptions"
import { STATE_NAMES } from "./slugs"

export const ALL_CATEGORY_OPTIONS: string[] = [
  "General",
  "Other",
  ...Object.keys(specialtyDescriptions),
  ...Object.values(STATE_NAMES),
]

export const SORTED_CATEGORY_OPTIONS = [...ALL_CATEGORY_OPTIONS].sort()

export function generateGuideSlug(title: string): string {
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

export function detectCategories(body: string): string[] {
  const lower = body.toLowerCase()
  return ALL_CATEGORY_OPTIONS.filter((opt) => lower.includes(opt.toLowerCase()))
}

export function insertMarkdown(
  textarea: HTMLTextAreaElement,
  before: string,
  after = "",
  placeholder = "text",
  onUpdate: (val: string) => void
) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = textarea.value.slice(start, end) || placeholder
  const newVal =
    textarea.value.slice(0, start) + before + selected + after + textarea.value.slice(end)
  onUpdate(newVal)
  setTimeout(() => {
    textarea.focus()
    const cursor = start + before.length + selected.length + after.length
    textarea.selectionStart = textarea.selectionEnd = cursor
  }, 0)
}
