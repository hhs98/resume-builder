export function isPdfBuffer(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer.slice(0, 5))
  if (bytes.length < 5) return false

  const header = String.fromCharCode(...bytes)
  return header.startsWith("%PDF-")
}

export const PDF_MAGIC_BYTE_ERROR =
  "Invalid PDF file. The upload must be a valid PDF document."
