export function isDbUnavailable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false

  const err = error as { code?: string; cause?: unknown; message?: string }

  if (
    err.code === "ECONNREFUSED" ||
    err.code === "P1000" ||
    err.code === "P1001" ||
    err.code === "P1017"
  ) {
    return true
  }

  if (err.cause && isDbUnavailable(err.cause)) return true

  const message = err.message ?? ""
  if (
    message.includes("ECONNREFUSED") ||
    message.includes("Can't reach database server") ||
    message.includes("Connection terminated")
  ) {
    return true
  }

  return false
}
