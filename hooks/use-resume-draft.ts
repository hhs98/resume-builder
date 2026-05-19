"use client"

import { useCallback, useSyncExternalStore } from "react"

import {
  EMPTY_RESUME_DRAFT,
  loadResumeDraft,
  mergeResumeDraft,
  saveResumeDraft,
  type ResumeDraft,
} from "@/lib/resume-draft"

function subscribe(onStoreChange: () => void) {
  window.addEventListener("resume-draft-changed", onStoreChange)
  window.addEventListener("storage", onStoreChange)
  return () => {
    window.removeEventListener("resume-draft-changed", onStoreChange)
    window.removeEventListener("storage", onStoreChange)
  }
}

const getSnapshot = loadResumeDraft
const getServerSnapshot = () => EMPTY_RESUME_DRAFT

export function useResumeDraft() {
  const draft = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const patchDraft = useCallback((patch: Partial<ResumeDraft>) => {
    const next = mergeResumeDraft(loadResumeDraft(), patch)
    saveResumeDraft(next)
  }, [])

  const replaceDraft = useCallback((next: ResumeDraft) => {
    saveResumeDraft(next)
  }, [])

  return { draft, patchDraft, replaceDraft, hydrated: true }
}
