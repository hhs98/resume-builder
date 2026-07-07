const DOWNLOAD_PERMIT_KEY = "jobmedia-download-permit"

export function storeDownloadPermit(permit: string) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(DOWNLOAD_PERMIT_KEY, permit)
}

export function getDownloadPermit(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(DOWNLOAD_PERMIT_KEY)
}

export function clearDownloadPermit() {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(DOWNLOAD_PERMIT_KEY)
}
