"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { useResumeDraft } from "@/hooks/use-resume-draft"
import { isHeadingContactValid } from "@/lib/resume-draft"

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1)
  return path
}

export function useRequireHeadingContact() {
  const pathname = normalizePath(usePathname() ?? "")
  const router = useRouter()
  const { draft } = useResumeDraft()

  useEffect(() => {
    if (pathname === "/new") return
    if (!pathname.startsWith("/new")) return

    if (!isHeadingContactValid(draft.contact)) {
      router.replace("/new")
    }
  }, [pathname, draft.contact, router])
}
