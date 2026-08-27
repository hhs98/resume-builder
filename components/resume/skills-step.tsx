"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Check,
  ChevronDown,
  ClipboardList,
  Pencil,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react"

import { BuilderStepFooter } from "@/components/resume/builder-step-footer"
import {
  BuilderStepHeader,
  BuilderStepPage,
  BuilderTipsButton,
} from "@/components/resume/builder-step-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useResumeDraft } from "@/hooks/use-resume-draft"
import { countSearchWords, SEARCH_AI_MIN_WORDS } from "@/lib/ai-search"
import {
  aiErrorFromResponse,
  parseAiResponseJson,
  toUserFacingAiError,
} from "@/lib/ai-errors"
import { MAX_SKILL_WORDS, normalizeSkillName } from "@/lib/enhance-skills"
import { getPrimaryJobTitle } from "@/lib/resume-draft"
import type { ResumeSkill } from "@/lib/resume-draft"
import { cn, generateId } from "@/lib/utils"

const MAX_SKILL_RATING = 5

const SKILL_RATING_LABELS: Record<number, string> = {
  1: "Beginner",
  2: "Elementary",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
}

function SkillRatingDots({
  skillName,
  rating,
  onChange,
}: {
  skillName: string
  rating: number
  onChange: (rating: number) => void
}) {
  const safeRating = Math.min(
    MAX_SKILL_RATING,
    Math.max(1, Math.round(rating) || 1)
  )

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <div
        className="inline-flex items-center gap-1"
        role="radiogroup"
        aria-label={`${skillName} proficiency`}
      >
        {Array.from({ length: MAX_SKILL_RATING }).map((_, index) => {
          const value = index + 1
          const filled = value <= safeRating

          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={value === safeRating}
              aria-label={`${value} of ${MAX_SKILL_RATING} — ${SKILL_RATING_LABELS[value]}`}
              title={SKILL_RATING_LABELS[value]}
              onClick={() => onChange(value)}
              className={cn(
                "flex size-5 items-center justify-center rounded-full transition-colors",
                "hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A65CC]/30"
              )}
            >
              <span
                className={cn(
                  "size-2.5 rounded-full border-2 transition-colors",
                  filled
                    ? "border-[#0A65CC] bg-[#0A65CC]"
                    : "border-muted-foreground/35 bg-transparent"
                )}
                aria-hidden
              />
            </button>
          )
        })}
      </div>
      <p className="text-[0.65rem] font-medium text-muted-foreground">
        {SKILL_RATING_LABELS[safeRating]}
      </p>
    </div>
  )
}

const SUGGESTED_ROLES = [
  "Customer Service",
  "Cashier",
  "Sales Associate",
  "Store Manager",
] as const

const SUGGESTED_ROLES_MORE = [
  "Barista",
  "Warehouse Worker",
  "Administrative Assistant",
  "Nurse",
  "Teacher",
  "Server",
] as const

const PREWRITTEN_EXAMPLES = [
  "Cash handling & balancing",
  "Point of sale (POS) systems",
  "Customer conflict resolution",
  "Inventory management",
  "Upselling & cross-selling",
  "Food safety & sanitation",
  "Opening & closing procedures",
  "Team scheduling",
  "Visual merchandising",
  "Loss prevention awareness",
  "Bilingual communication",
  "Active listening",
  "Microsoft Office",
  "Data entry & accuracy",
  "Time management",
  "Training new hires",
  "Quality assurance",
  "Relationship building",
  "Problem solving",
  "Adaptability in fast-paced settings",
] as const

function newSkillId() {
  return generateId()
}

type SkillSuggestionListProps = {
  skills: string[]
  skillNamesLower: Set<string>
  customDraft: string
  onStage: (skill: string) => void
  keyPrefix: string
}

function SkillSuggestionList({
  skills,
  skillNamesLower,
  customDraft,
  onStage,
  keyPrefix,
}: SkillSuggestionListProps) {
  return (
    <ul className="divide-y divide-blue-200/60">
      {skills.map((skill, skillIndex) => {
        const added = skillNamesLower.has(skill.toLowerCase())
        const staged =
          !added &&
          normalizeSkillName(customDraft).toLowerCase() === skill.toLowerCase()

        return (
          <li
            key={`${keyPrefix}-${skillIndex}-${skill}`}
            className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5"
          >
            <span className="flex min-w-0 gap-2 text-sm leading-snug text-foreground">
              <span className="shrink-0 text-blue-600" aria-hidden>
                •
              </span>
              <span>{skill}</span>
            </span>
            <button
              type="button"
              disabled={added}
              onClick={() => onStage(skill)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                added
                  ? "cursor-default border-emerald-200 bg-emerald-50 text-emerald-700"
                  : staged
                    ? "border-blue-200 bg-blue-100 text-blue-700"
                    : "border-blue-500 bg-white text-blue-600 hover:bg-blue-50"
              )}
            >
              {added ? (
                <Check className="size-3.5" aria-hidden />
              ) : (
                <Plus className="size-3.5" aria-hidden />
              )}
              {added ? "Added" : staged ? "In editor" : "ADD"}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function SkillsStep() {
  const { draft, patchDraft } = useResumeDraft()
  const skills = draft.skills
  const [search, setSearch] = useState("")
  const [activeRole, setActiveRole] = useState<string>("Customer Service")
  const [customDraft, setCustomDraft] = useState("")
  const [showMoreRoles, setShowMoreRoles] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhanceError, setEnhanceError] = useState<string | null>(null)
  const [pendingSkills, setPendingSkills] = useState<string[]>([])
  const [searchAiSkills, setSearchAiSkills] = useState<string[]>([])
  const [isSearchAiLoading, setIsSearchAiLoading] = useState(false)
  const [searchAiError, setSearchAiError] = useState<string | null>(null)
  const customSkillsRef = useRef<HTMLTextAreaElement>(null)
  const draftRef = useRef(draft)
  const skillNameSnapshotRef = useRef<Record<string, string>>({})
  const [lastAiSearchQuery, setLastAiSearchQuery] = useState<string | null>(null)
  const searchAbortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  const visibleSuggestedRoles = showMoreRoles
    ? [...SUGGESTED_ROLES, ...SUGGESTED_ROLES_MORE]
    : [...SUGGESTED_ROLES]

  function setSkills(next: ResumeSkill[]) {
    patchDraft({ skills: next })
  }

  const filteredExamples = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return [...PREWRITTEN_EXAMPLES]
    return PREWRITTEN_EXAMPLES.filter((s) => s.toLowerCase().includes(q))
  }, [search])

  const searchQuery = search.trim()
  const hasStaticResults = filteredExamples.length > 0
  const searchWordCount = countSearchWords(searchQuery)
  const canSearchWithAi =
    !hasStaticResults &&
    searchQuery.length > 0 &&
    searchWordCount >= SEARCH_AI_MIN_WORDS
  const showNoStaticMatch = !hasStaticResults && searchQuery.length > 0
  const hasAiResultsForQuery =
    lastAiSearchQuery === searchQuery && searchAiSkills.length > 0
  const showAiSearchButton =
    canSearchWithAi && !isSearchAiLoading && !hasAiResultsForQuery

  useEffect(() => {
    searchAbortRef.current?.abort()
  }, [searchQuery])

  async function runSearchWithAi() {
    if (!canSearchWithAi || isSearchAiLoading) return

    searchAbortRef.current?.abort()
    const controller = new AbortController()
    searchAbortRef.current = controller
    const queryToFetch = searchQuery

    setIsSearchAiLoading(true)
    setSearchAiError(null)

    try {
      const currentDraft = draftRef.current
      const response = await fetch("/api/ai/enhance-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          input: queryToFetch,
          jobTitle: getPrimaryJobTitle(currentDraft),
          existingSkills: currentDraft.skills.map((skill) => skill.name),
        }),
      })

      const data = await parseAiResponseJson<{
        skills?: string[]
        error?: string
      }>(response)

      if (!response.ok) {
        throw new Error(
          aiErrorFromResponse(
            response,
            data,
            "We couldn't find skill suggestions right now. Please try again."
          )
        )
      }

      if (!data.skills?.length) {
        throw new Error(
          "AI didn't return any matching skills. Try a different search phrase."
        )
      }

      setLastAiSearchQuery(queryToFetch)
      setSearchAiSkills(data.skills)
    } catch (error) {
      if (controller.signal.aborted) return
      setSearchAiSkills([])
      setSearchAiError(
        toUserFacingAiError(
          error,
          "We couldn't find skill suggestions right now. Please try again."
        )
      )
    } finally {
      if (!controller.signal.aborted) {
        setIsSearchAiLoading(false)
      }
    }
  }

  const skillNamesLower = useMemo(
    () => new Set(skills.map((s) => s.name.toLowerCase())),
    [skills]
  )

  function addSkill(name: string) {
    const trimmed = normalizeSkillName(name)
    if (!trimmed) return
    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      return
    }
    setSkills([...skills, { id: newSkillId(), name: trimmed, rating: 3 }])
  }

  function removeSkill(id: string) {
    setSkills(skills.filter((s) => s.id !== id))
  }

  function setSkillRating(id: string, rating: number) {
    const nextRating = Math.min(
      MAX_SKILL_RATING,
      Math.max(1, Math.round(rating))
    )
    updateSkill(id, { rating: nextRating })
  }

  function updateSkill(id: string, patch: Partial<ResumeSkill>) {
    setSkills(
      skills.map((skill) => (skill.id === id ? { ...skill, ...patch } : skill))
    )
  }

  function finalizeSkillName(id: string, rawName: string) {
    const trimmed = rawName.trim().replace(/\s+/g, " ")
    const revertTo = skillNameSnapshotRef.current[id]
    const current = skills.find((skill) => skill.id === id)
    if (!current) return

    delete skillNameSnapshotRef.current[id]

    if (!trimmed) {
      removeSkill(id)
      return
    }

    const isDuplicate = skills.some(
      (skill) =>
        skill.id !== id && skill.name.toLowerCase() === trimmed.toLowerCase()
    )

    if (isDuplicate) {
      updateSkill(id, { name: revertTo ?? current.name })
      return
    }

    if (trimmed !== current.name) {
      updateSkill(id, { name: trimmed })
    }
  }

  function cancelSkillEdit(id: string) {
    const revertTo = skillNameSnapshotRef.current[id]
    delete skillNameSnapshotRef.current[id]
    if (revertTo !== undefined) {
      updateSkill(id, { name: revertTo })
    }
  }

  function addCustomFromTextarea() {
    const parts = customDraft
      .split(/[,;\n]+/)
      .map((p) => normalizeSkillName(p))
      .filter(Boolean)
    const existing = new Set(skills.map((s) => s.name.toLowerCase()))
    const next = [...skills]
    for (const p of parts) {
      const lower = p.toLowerCase()
      if (existing.has(lower)) continue
      existing.add(lower)
      next.push({ id: newSkillId(), name: p, rating: 3 })
    }
    setSkills(next)
    setCustomDraft("")
  }

  function stageSuggestedSkill(skill: string) {
    const normalized = normalizeSkillName(skill)
    if (!normalized) return

    setCustomDraft(normalized)
    setEnhanceError(null)
    setSearchAiError(null)
    customSkillsRef.current?.focus()
  }

  async function enhanceCustomSkills() {
    const jobTitle = getPrimaryJobTitle(draft)

    if (!customDraft.trim() && !jobTitle) {
      setEnhanceError(
        "Add a custom skill or job title in your contact/work history before using AI enhance."
      )
      return
    }

    setEnhanceError(null)
    setIsEnhancing(true)

    try {
      const response = await fetch("/api/ai/enhance-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: customDraft,
          jobTitle,
          existingSkills: skills.map((skill) => skill.name),
        }),
      })

      const data = await parseAiResponseJson<{
        skills?: string[]
        error?: string
      }>(response)

      if (!response.ok) {
        throw new Error(
          aiErrorFromResponse(
            response,
            data,
            "We couldn't generate skill suggestions right now. Please try again."
          )
        )
      }

      if (!data.skills?.length) {
        throw new Error(
          "AI didn't return any skill suggestions. Add a bit more detail and try again."
        )
      }

      setPendingSkills(data.skills)
    } catch (error) {
      setEnhanceError(
        toUserFacingAiError(
          error,
          "We couldn't generate skill suggestions right now. Please try again."
        )
      )
    } finally {
      setIsEnhancing(false)
    }
  }

  return (
    <BuilderStepPage maxWidth="6xl">
      <BuilderStepHeader
        title="What skills would you like to highlight?"
        description="Choose from our pre-written examples below or write your own."
        action={<BuilderTipsButton />}
      />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start xl:grid-cols-[1fr_380px]">
          <div className="min-w-0 space-y-6">
            <div className="space-y-3">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="skillSearch"
                  placeholder="Search for skills (e.g. Project Management, SQL)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && showAiSearchButton) {
                      e.preventDefault()
                      void runSearchWithAi()
                    }
                  }}
                  className="h-12 rounded-xl border border-border/70 bg-white pl-10 text-sm text-foreground shadow-none placeholder:text-[#9ca3af]"
                  aria-label="Search for skills"
                />
              </div>
              {showAiSearchButton ? (
                <Button
                  type="button"
                  onClick={() => void runSearchWithAi()}
                  className="h-10 w-full rounded-xl bg-blue-600 font-semibold hover:bg-blue-700 sm:w-auto sm:px-5"
                >
                  <Sparkles className="size-4" aria-hidden />
                  Search with AI
                </Button>
              ) : null}
            </div>

            <section className="space-y-3">
              <h2 className="text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Suggested Roles
              </h2>
              <div className="flex flex-wrap gap-2">
                {visibleSuggestedRoles.map((role) => {
                  const active = activeRole === role
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setActiveRole(role)}
                      className={cn(
                        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-border/70 bg-white text-foreground hover:border-blue-200"
                      )}
                    >
                      {role}
                    </button>
                  )
                })}
              </div>
              {SUGGESTED_ROLES_MORE.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowMoreRoles((open) => !open)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
                  aria-expanded={showMoreRoles}
                >
                  {showMoreRoles ? "Show less" : "Show more"}
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform",
                      showMoreRoles && "rotate-180"
                    )}
                    aria-hidden
                  />
                </button>
              ) : null}
            </section>

            <section className="overflow-hidden rounded-2xl border border-border/60 bg-white">
              <div className="border-b border-border/60 px-5 py-4">
                <h2 className="text-base font-semibold text-foreground">
                  {showNoStaticMatch ? "Search Results" : "Ready to Use Examples"}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {showNoStaticMatch
                    ? "No curated match found. Use Search with AI when you have at least 5 words."
                    : "Click to quickly add these to your resume"}
                </p>
              </div>
              <div className="max-h-[min(28rem,50vh)] overflow-y-auto overscroll-contain">
                {hasStaticResults ? (
                  <ul className="divide-y divide-border/60">
                    {filteredExamples.map((example) => {
                      const added = skillNamesLower.has(example.toLowerCase())
                      return (
                        <li
                          key={example}
                          className="flex items-center justify-between gap-4 px-5 py-4"
                        >
                          <span className="min-w-0 text-sm leading-snug text-foreground">
                            {example}
                          </span>
                          <button
                            type="button"
                            disabled={added}
                            onClick={() => addSkill(example)}
                            className={cn(
                              "inline-flex shrink-0 items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                              added
                                ? "cursor-default border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-blue-500 text-blue-600 hover:bg-blue-50"
                            )}
                          >
                            {added ? (
                              <Check className="size-3.5" aria-hidden />
                            ) : (
                              <Plus className="size-3.5" aria-hidden />
                            )}
                            {added ? "Added" : "ADD"}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                ) : searchQuery.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Start typing to search curated skills.
                  </div>
                ) : searchWordCount < SEARCH_AI_MIN_WORDS ? (
                  <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Type at least {SEARCH_AI_MIN_WORDS} words, then use Search with
                    AI.
                  </div>
                ) : isSearchAiLoading ? (
                  <div className="flex items-center justify-center gap-2 px-5 py-10 text-sm text-muted-foreground">
                    <Sparkles className="size-4 text-blue-600" aria-hidden />
                    Searching with AI...
                  </div>
                ) : searchAiError ? (
                  <div className="px-5 py-8 text-center text-sm text-destructive">
                    {searchAiError}
                  </div>
                ) : hasAiResultsForQuery ? (
                  <div>
                    <div className="border-b border-blue-200/80 bg-blue-50/40 px-5 py-3">
                      <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                        AI suggestions
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Click ADD to edit a skill in Custom Skill, then Add to
                        list.
                      </p>
                    </div>
                    <SkillSuggestionList
                      skills={searchAiSkills}
                      skillNamesLower={skillNamesLower}
                      customDraft={customDraft}
                      onStage={stageSuggestedSkill}
                      keyPrefix="search-ai"
                    />
                  </div>
                ) : showAiSearchButton ? (
                  <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                      No curated skills match. Search with AI for suggestions.
                    </p>
                    <Button
                      type="button"
                      onClick={() => void runSearchWithAi()}
                      className="h-10 rounded-xl bg-blue-600 px-5 font-semibold hover:bg-blue-700"
                    >
                      <Sparkles className="size-4" aria-hidden />
                      Search with AI
                    </Button>
                  </div>
                ) : (
                  <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No skills found for this search.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="min-w-0 space-y-5 lg:sticky lg:top-6">
            <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-foreground">
                  Custom Skill
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={isEnhancing}
                    onClick={enhanceCustomSkills}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-60"
                  >
                    <Sparkles className="size-3.5" aria-hidden />
                    {isEnhancing ? "Generating..." : "Enhance with AI"}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Each skill can be up to {MAX_SKILL_WORDS} words.
              </p>
              {enhanceError ? (
                <p className="mt-2 text-xs text-destructive">{enhanceError}</p>
              ) : null}
              {pendingSkills.length > 0 ? (
                <div className="mt-3 overflow-hidden rounded-xl border border-blue-200 bg-blue-50/50">
                  <div className="border-b border-blue-200/80 px-4 py-3">
                    <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                      AI suggestion
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Click ADD to move a skill into the editor below, edit it,
                      then use Add to list.
                    </p>
                  </div>
                  <SkillSuggestionList
                    skills={pendingSkills}
                    skillNamesLower={skillNamesLower}
                    customDraft={customDraft}
                    onStage={stageSuggestedSkill}
                    keyPrefix="custom-ai"
                  />
                </div>
              ) : null}
              <Textarea
                ref={customSkillsRef}
                id="customSkills"
                className="mt-4 min-h-28 resize-none rounded-xl border border-border/70 bg-[#f8f9fb] text-sm text-foreground shadow-none"
                placeholder="Type a skill and hit enter..."
                aria-label="Add custom skill"
                value={customDraft}
                onChange={(e) => setCustomDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    addCustomFromTextarea()
                  }
                }}
              />
              <Button
                type="button"
                className="mt-4 h-11 w-full rounded-xl bg-blue-600 font-semibold hover:bg-blue-700"
                onClick={addCustomFromTextarea}
              >
                Add to list
              </Button>
            </div>

            <div className="rounded-2xl border border-border/60 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Selected Skills
                  </h2>
                  {skills.length > 0 ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Click a skill to edit its name, and use the dots to set
                      proficiency
                    </p>
                  ) : null}
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                  Skills: {skills.length}
                </span>
              </div>

              {skills.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-border/50 bg-[#f8f9fb]/80 px-4 py-10 text-center">
                  <ClipboardList
                    className="size-8 text-muted-foreground/50"
                    aria-hidden
                  />
                <p className="mt-3 text-sm text-muted-foreground">
                  No skills added yet. Select from the left or type above.
                </p>
                </div>
              ) : (
                <ul className="mt-4 space-y-2">
                  {skills.map((skill) => (
                    <li
                      key={skill.id}
                      className="group rounded-lg border border-border/60 bg-[#f8f9fb] px-2 py-2 transition-colors focus-within:border-[#0A65CC]/40 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0A65CC]/10"
                    >
                      <div className="flex items-start gap-2">
                        <Pencil
                          className="mt-2 ml-1 size-3.5 shrink-0 text-muted-foreground/50 group-focus-within:text-[#0A65CC]"
                          aria-hidden
                        />
                        <Textarea
                          value={skill.name}
                          rows={1}
                          ref={(el) => {
                            if (!el) return
                            el.style.height = "auto"
                            el.style.height = `${Math.max(el.scrollHeight, 36)}px`
                          }}
                          onFocus={(e) => {
                            skillNameSnapshotRef.current[skill.id] = skill.name
                            const el = e.currentTarget
                            el.style.height = "auto"
                            el.style.height = `${Math.max(el.scrollHeight, 36)}px`
                          }}
                          onChange={(e) => {
                            updateSkill(skill.id, { name: e.target.value })
                            const el = e.currentTarget
                            el.style.height = "auto"
                            el.style.height = `${Math.max(el.scrollHeight, 36)}px`
                          }}
                          onBlur={(e) =>
                            finalizeSkillName(skill.id, e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              e.currentTarget.blur()
                            }
                            if (e.key === "Escape") {
                              e.preventDefault()
                              cancelSkillEdit(skill.id)
                              e.currentTarget.blur()
                            }
                          }}
                          aria-label={`Edit skill: ${skill.name}`}
                          className="field-sizing-content min-h-9 min-w-0 flex-1 resize-none overflow-hidden border-0 bg-transparent px-1 py-1.5 text-sm leading-snug whitespace-pre-wrap break-words shadow-none focus-visible:ring-0"
                        />
                        <button
                          type="button"
                          onClick={() => removeSkill(skill.id)}
                          className="mt-1 shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Remove ${skill.name}`}
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between gap-3 border-t border-border/40 px-1 pt-2 sm:justify-end">
                        <p className="text-xs text-muted-foreground sm:hidden">
                          Proficiency
                        </p>
                        <SkillRatingDots
                          skillName={skill.name}
                          rating={skill.rating}
                          onChange={(rating) =>
                            setSkillRating(skill.id, rating)
                          }
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <BuilderStepFooter
          backHref="/new/training"
          nextHref="/new/languages"
          nextLabel="Next: Languages"
        />
    </BuilderStepPage>
  )
}
