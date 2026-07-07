export type ResumePreviewTone = "default" | "preview"

/**
 * Industry-standard preview palettes for finalize screen only.
 * Each template gets a distinct ATS-friendly accent; PDF/print keep brand colors.
 */
export function getClassicPreviewColors(tone: ResumePreviewTone = "default") {
  return tone === "preview"
    ? {
        red: "#1e3a5f",
        pink: "#e8eef5",
        link: "#1e3a5f",
      }
    : { red: "#c41e3a", pink: "#f8d4da", link: "#991b1b" }
}

export function getModernPreviewColors(tone: ResumePreviewTone = "default") {
  return tone === "preview"
    ? {
        gold: "#0f766e",
        contactBar: "#ecfdf5",
        link: "#0f766e",
      }
    : { gold: "#d49000", contactBar: "#f5f5f5", link: "#92400e" }
}

export function getMinimalPreviewColors(tone: ResumePreviewTone = "default") {
  return tone === "preview"
    ? {
        pink: "#f5f5f4",
        ink: "#292524",
        rating: "#78716c",
        link: "#44403c",
      }
    : { pink: "#f8d4da", ink: "#334155", rating: "#f8d4da", link: "#334155" }
}

export function getExecutivePreviewColors(tone: ResumePreviewTone = "default") {
  return tone === "preview"
    ? {
        sidebar: "#5a7185",
        sidebarHeader: "#4a5f72",
        accent: "#4a5f72",
        link: "#3d4f5f",
      }
    : {
        sidebar: "#34495e",
        sidebarHeader: "#3d5669",
        accent: "#34495e",
        link: "#2c3e50",
      }
}
