function sanitizeFileName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
}

export async function downloadResumePdf(
  containerId: string,
  displayName: string
): Promise<void> {
  const container = document.getElementById(containerId)
  if (!container) {
    throw new Error("Resume preview not found")
  }

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ])

  const previousTransform = container.style.transform
  container.style.transform = "none"

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      onclone: (documentClone) => {
        const cloned = documentClone.getElementById(containerId)
        if (cloned) {
          cloned.style.transform = "none"
        }
      },
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    const baseName = sanitizeFileName(displayName) || "resume"
    pdf.save(`${baseName}.pdf`)
  } finally {
    container.style.transform = previousTransform
  }
}

export async function downloadResumePdfUrl(
  resumeId: string,
  displayName: string
): Promise<void> {
  const res = await fetch(`/api/resumes/${resumeId}/pdf`, {
    method: "POST",
  })

  if (!res.ok) {
    let message = "Failed to generate PDF."
    try {
      const data = (await res.json()) as { error?: string }
      if (data.error) message = data.error
    } catch {
      // Response was not JSON — keep default message.
    }
    throw new Error(message)
  }

  const blob = await res.blob()
  const downloadUrl = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = downloadUrl
  const baseName = sanitizeFileName(displayName) || "resume"
  a.download = `${baseName}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(downloadUrl)
}
