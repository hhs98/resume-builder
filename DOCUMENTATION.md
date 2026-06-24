# Job Media AI Resume Builder — Documentation

A Next.js resume builder for **Job Media** (`jobmedia.com.bd`). Users complete a multi-step wizard, preview ATS-friendly templates, optionally use local **Ollama** AI for suggestions, verify their phone number, save the resume to PostgreSQL, and download a PDF.

---

## Table of contents

1. [Overview](#overview)
2. [Tech stack](#tech-stack)
3. [Getting started](#getting-started)
4. [Environment variables](#environment-variables)
5. [Project structure](#project-structure)
6. [Architecture](#architecture)
7. [User flows](#user-flows)
8. [Builder steps](#builder-steps)
9. [Resume templates](#resume-templates)
10. [AI features](#ai-features)
11. [API reference](#api-reference)
12. [Database schema](#database-schema)
13. [PDF generation](#pdf-generation)
14. [Phone verification & download](#phone-verification--download)
15. [State management](#state-management)
16. [Rate limiting](#rate-limiting)
17. [Error handling](#error-handling)
18. [Styling & print CSS](#styling--print-css)
19. [Scripts](#scripts)
20. [Database migrations](#database-migrations)
21. [Deployment notes](#deployment-notes)
22. [Troubleshooting](#troubleshooting)

---

## Overview

| Item | Detail |
|------|--------|
| **Product** | Job Media AI Resume Builder |
| **Package name** | `resume-builder` |
| **Version** | `0.0.1` |
| **Framework** | Next.js 16 (App Router, Turbopack in dev) |
| **Language** | TypeScript |
| **Database** | PostgreSQL via Prisma 7 + `@prisma/adapter-pg` |
| **AI backend** | Ollama (local or LAN) — never called from the browser |
| **PDF engine** | Gotenberg (Chromium URL → PDF) |
| **Draft storage** | `localStorage` key `jobmedia-resume-draft-v1` |
| **Persistent storage** | PostgreSQL (on verified download) |

### High-level flow

```
Landing (/) → Builder (/new/*) → Finalize → OTP verify → Save to DB → Download PDF
                     ↓
              localStorage draft
                     ↓
              Ollama AI (optional, per step)
```

---

## Tech stack

### Core

- **Next.js** `16.1.7` — App Router, API routes, server components
- **React** `19.2.4`
- **TypeScript** `5.9`
- **Tailwind CSS** `4.2` + **shadcn/ui** components
- **Prisma** `7.8` with PostgreSQL (`pg` driver)

### Features

- **Ollama** — LLM inference for work history, skills, summary
- **Gotenberg** — headless Chromium PDF conversion
- **Google reCAPTCHA v3** — OTP request protection
- **html2canvas-pro** + **jsPDF** — client-side PDF fallback (available in code)
- **Job Media Provider API** — SMS OTP for download permit

---

## Getting started

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL database (e.g. Neon)
- Ollama instance for AI features (local or LAN)
- Gotenberg reachable from the server for server-side PDF (optional for dev)

### Install & run

```bash
pnpm install
cp .env.example .env
# Edit .env with your DATABASE_URL and Ollama settings

npx prisma migrate deploy
npx prisma generate

pnpm run dev      # http://localhost:3000
pnpm run build
pnpm run start
pnpm run typecheck
pnpm run lint
```

### Ollama setup

```bash
# Local
brew install ollama
ollama serve
ollama pull qwen2.5:7b

# Or point OLLAMA_BASE_URL to a LAN machine running Ollama
curl http://127.0.0.1:11434/api/tags   # verify connectivity
```

---

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `OLLAMA_BASE_URL` | No | `http://127.0.0.1:11434` | Ollama server URL (no trailing slash) |
| `OLLAMA_MODEL` | No | `qwen2.5:7b` | Model name for `/api/generate` |
| `GOTENBERG_URL` | No | `https://demo.gotenberg.dev/forms/chromium/convert/url` | Gotenberg Chromium URL-to-PDF endpoint |
| `RESUME_PREVIEW_BASE_URL` | No | Auto-detect host, else `https://cv.jobmedia.com.bd` | Public URL Gotenberg uses to load the print preview |

See `.env.example` for a template.

---

## Project structure

```
resume-builder/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── enhance-work-history/route.ts
│   │   │   ├── enhance-skills/route.ts
│   │   │   └── enhance-summary/route.ts
│   │   ├── download/
│   │   │   ├── request-otp/route.ts
│   │   │   └── verify-otp/route.ts
│   │   └── resumes/
│   │       ├── route.ts              # POST — create resume
│   │       └── [id]/
│   │           ├── route.ts          # GET — fetch resume as draft JSON
│   │           └── pdf/route.ts      # POST — generate PDF via Gotenberg
│   ├── my-resume/preview/
│   │   ├── page.tsx                  # Local draft preview (localStorage)
│   │   └── [id]/
│   │       ├── page.tsx              # DB resume preview (client fetch)
│   │       └── print/page.tsx        # Server-rendered print view (for PDF)
│   ├── new/                          # Builder wizard pages
│   │   ├── layout.tsx                # BuilderShell wrapper
│   │   ├── page.tsx                  # Heading / contact
│   │   ├── work-history/page.tsx
│   │   ├── education/page.tsx
│   │   ├── skills/page.tsx
│   │   ├── languages/page.tsx
│   │   ├── summary/page.tsx
│   │   ├── references/page.tsx
│   │   └── finalize/page.tsx
│   ├── import/page.tsx
│   ├── page.tsx                      # Landing
│   ├── layout.tsx                    # Root layout
│   └── globals.css
├── components/
│   ├── landing/                      # Marketing landing page
│   ├── resume/
│   │   ├── *-step.tsx                # Builder step UIs
│   │   ├── builder-shell.tsx         # Sidebar nav + progress
│   │   ├── resume-preview.tsx        # Template router
│   │   ├── download-pdf-verify-dialog.tsx
│   │   ├── finalize-step.tsx
│   │   ├── education-additional-details.tsx
│   │   └── templates/                # 4 resume templates
│   └── ui/                           # shadcn/ui primitives
├── hooks/
│   ├── use-resume-draft.ts           # localStorage draft hook
│   └── use-require-heading-contact.ts
├── lib/
│   ├── resume-draft.ts               # Types, validation, helpers
│   ├── get-resume-draft-from-db.ts   # Prisma → ResumeDraft mapper
│   ├── enhance-work-history.ts
│   ├── enhance-skills.ts
│   ├── enhance-summary.ts
│   ├── ollama.ts                     # Ollama client (server-only)
│   ├── ai-errors.ts                  # User-friendly AI error messages
│   ├── ai-search.ts                  # Hybrid search constants
│   ├── rate-limit.ts                 # In-memory IP rate limiting
│   ├── download-resume-pdf.ts        # Client PDF + server PDF fetch
│   ├── prisma.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── generated/prisma/                 # Prisma client output
├── public/                           # Static assets (logo, images)
├── .env.example
├── DOCUMENTATION.md                  # This file
└── package.json
```

---

## Architecture

### Dual storage model

1. **Draft (client)** — While building, all data lives in `localStorage` via `useResumeDraft()`. No account required.
2. **Saved resume (server)** — After OTP verification on download, the full `ResumeDraft` is POSTed to `/api/resumes` and stored in PostgreSQL.

### Data type: `ResumeDraft`

Defined in `lib/resume-draft.ts`. Single source of truth for the builder UI, API payloads, and previews.

```ts
type ResumeDraft = {
  id: string
  templateId: "classic" | "modern" | "minimal" | "executive"
  contact: { givenName, familyName, profession, city, postalCode, division, phone, email, photoDataUrl }
  workHistory: WorkHistoryItem[]
  education: { educationLevel, institution, ..., description, projectUrl, gpa, awards[] }
  skills: ResumeSkill[]
  languages: ResumeLanguage[]
  references: ResumeReference[]
  summary: string
}
```

### Server vs client boundaries

| Concern | Where it runs |
|---------|---------------|
| Ollama calls | Server API routes only (`lib/ollama.ts`) |
| Draft editing | Browser (`localStorage`) |
| OTP / reCAPTCHA | Browser → Next API → Job Media Provider |
| PDF (Gotenberg) | Server fetches public preview URL |
| Print preview SSR | `app/my-resume/preview/[id]/print/page.tsx` |

---

## User flows

### 1. New resume

1. User lands on `/`
2. Chooses to start fresh → `/new` (Heading step)
3. Completes builder steps; draft auto-saves to `localStorage`
4. On Finalize, picks a template and reviews completeness score
5. Clicks **Download PDF** → verification dialog (name + phone from heading)
6. OTP sent via Job Media Provider API
7. On verify → resume saved to DB → PDF downloaded

### 2. Preview (local draft)

- `/my-resume/preview` — renders `localStorage` draft in browser

### 3. Preview (saved resume)

- `/my-resume/preview/[id]` — fetches `/api/resumes/[id]`, client-rendered
- `/my-resume/preview/[id]/print` — server-rendered from DB (used for PDF)

### 4. Import (placeholder)

- `/import` — stub page for future resume upload flow

---

## Builder steps

Navigation is defined in `components/resume/builder-shell.tsx` as `BUILDER_STEPS`:

| Step | Route | Component | Key features |
|------|-------|-----------|--------------|
| Heading | `/new` | `new-contact-step.tsx` | Name, title, location, phone, email, photo |
| Work History | `/new/work-history` | `work-history-step.tsx` | Multiple jobs, **AI Suggest** bullets |
| Education | `/new/education` | `education-step.tsx` | Degree, institution, additional details (GPA, awards, description, project URL) |
| Skills | `/new/skills` | `skills-step.tsx` | Skill list, ratings, **Enhance with AI**, hybrid search |
| Languages | `/new/languages` | `languages-step.tsx` | Language + proficiency rating |
| Summary | `/new/summary` | `summary-step.tsx` | 500-char limit, **Enhance with AI**, hybrid search |
| References | `/new/references` | `references-step.tsx` | Name, job title, company, email, phone |
| Finalize | `/new/finalize` | `finalize-step.tsx` | Template picker, review checklist, PDF download |

### Gating

- `useRequireHeadingContact()` redirects to `/new` if heading contact is invalid before other steps.
- Heading requires: given name, family name, profession, city, postal code, division, phone, valid email.

### Completeness score

`computeResumeCompleteness()` in `lib/resume-draft.ts` checks 9 criteria (email, name, phone/title, first job, education level, skills, summary ≥40 chars, complete reference, languages). Displayed as a percentage in the sidebar and finalize header.

---

## Resume templates

`ResumePreview` (`components/resume/resume-preview.tsx`) routes by `templateId`:

| ID | Component | Style |
|----|-----------|-------|
| `classic` | `classic-red-preview.tsx` | Red accent, traditional layout |
| `modern` | `modern-gold-preview.tsx` | Gold accent, contemporary |
| `minimal` | `minimal-two-column-preview.tsx` | Two-column, text-focused |
| `executive` | `executive-sidebar-preview.tsx` | Sidebar layout, serif feel |

All templates share helpers from `lib/resume-draft.ts` (`getFullName`, `getPreviewSkills`, `formatWorkDates`, etc.) and `education-additional-details.tsx` for education extras.

---

## AI features

AI is powered by **Ollama** on the server. The browser never calls Ollama directly.

### Architecture

```
Browser → POST /api/ai/* → lib/ollama.ts → OLLAMA_BASE_URL/api/generate
```

### Endpoints & rate limits

| Endpoint | Purpose | Rate limit key | Limit |
|----------|---------|----------------|-------|
| `POST /api/ai/enhance-work-history` | Bullet suggestions for a job | `ai-enhance-work-history:{ip}` | 5/hour |
| `POST /api/ai/enhance-skills` | Skill suggestions + search | `ai-enhance-skills:{ip}` | 5/hour |
| `POST /api/ai/enhance-summary` | Summary suggestions + search | `ai-enhance-summary:{ip}` | 5/hour |

Rate limiting is in-memory (`lib/rate-limit.ts`) — resets on server restart; use Redis for production multi-instance deployments.

### Work history — AI Suggest

- Requires job title or employer
- Returns 3–5 bullet points (`•` prefixed)
- UI: preview suggestions → **ADD** per line appends to textarea → **Undo**
- Prompt: `lib/enhance-work-history.ts`

### Skills — Enhance with AI

- Uses **primary job title** (`getPrimaryJobTitle`: profession → current job → first job title)
- Max **5 words** per skill
- **Enhance with AI**: suggestions → **ADD** stages into custom skill textarea → user edits → **Add to list**
- Prompt: `lib/enhance-skills.ts`

### Skills / Summary — Hybrid search

- Static prewritten examples searched first
- **Search with AI** button appears when no static match and query has ≥ **5 words** (`SEARCH_AI_MIN_WORDS`)
- API called only on button click or Enter — not on every keystroke
- Results cached per query in component state

### Summary — Enhance with AI

- 500-character limit (`SUMMARY_CHAR_LIMIT`)
- Same hybrid search pattern as skills
- **Enhance with AI** + per-summary **ADD** → textarea + **Undo**

### Job title resolution

```ts
getPrimaryJobTitle(draft):
  1. contact.profession
  2. current work history job title
  3. first work history job title
```

---

## API reference

### `POST /api/resumes`

Creates a resume from a `ResumeDraft` JSON body. Returns `{ success: true, id: string }`.

### `GET /api/resumes/[id]`

Returns resume as `ResumeDraft`-shaped JSON (without re-creating client `id` on nested items from DB).

### `POST /api/resumes/[id]/pdf`

1. Loads resume from DB
2. Builds preview URL: `{RESUME_PREVIEW_BASE_URL}/my-resume/preview/{id}`
3. Sends to Gotenberg with `waitForSelector: #resume-print-preview[data-resume-ready='true']`
4. Returns `application/pdf` attachment

**Note:** For reliable PDFs, the server-rendered print page at `/my-resume/preview/[id]/print` is recommended; ensure `RESUME_PREVIEW_BASE_URL` points to a URL Gotenberg can reach.

### `POST /api/download/request-otp`

Proxies to Job Media Provider:

```
POST https://provider.jobmedia.com.bd/api/account/download-permit/
Body: { phone_number: "+88{phone}", full_name, user_type: "jobseeker", recaptcha }
```

### `POST /api/download/verify-otp`

Same provider URL with `otp` field (6 digits).

### `POST /api/ai/enhance-work-history`

**Body:**

```json
{
  "jobTitle": "string",
  "employer": "string",
  "location": "string",
  "remote": false,
  "startMonth": "string",
  "startYear": "string",
  "endMonth": "string",
  "endYear": "string",
  "currentJob": false,
  "responsibilities": "string"
}
```

**Response:** `{ "responsibilities": "• bullet\n• bullet" }`

### `POST /api/ai/enhance-skills`

**Body:**

```json
{
  "input": "string",
  "jobTitle": "string",
  "existingSkills": ["string"]
}
```

**Response:** `{ "skills": ["string"] }`

### `POST /api/ai/enhance-summary`

**Body:**

```json
{
  "input": "string",
  "jobTitle": "string",
  "currentSummary": "string",
  "skills": ["string"]
}
```

**Response:** `{ "summaries": ["string"] }`

---

## Database schema

PostgreSQL via Prisma. Client generated to `generated/prisma/`.

### `Resume`

Core record: `templateId`, contact fields (`givenName`, `familyName`, `profession`, `city`, `postalCode`, `division`, `phone`, `email`, `photoDataUrl`), `summary`.

### Relations

| Model | Cardinality | Notes |
|-------|-------------|-------|
| `WorkHistory` | 1:N | Job entries with dates, remote flag, responsibilities |
| `Education` | 1:1 | Includes `description`, `projectUrl`, `gpa`, `awards` (JSON) |
| `Skill` | 1:N | `name`, `rating` |
| `Language` | 1:N | `name`, `rating` (1–4 proficiency) |
| `Reference` | 1:N | `name`, `designation`, `organization`, `phone`, `email` |

References no longer store a `relationship` / `address` field (removed in migration `20260616140000_remove_reference_address`).

### Migrations

| Migration | Description |
|-----------|-------------|
| `20260615094710_init` | Initial schema |
| `20260616120000_add_education_additional_details` | Education description, projectUrl, gpa, awards |
| `20260616140000_remove_reference_address` | Drop `Reference.address` |

---

## PDF generation

### Server-side (primary download flow)

Used by `downloadResumePdfUrl()` in `lib/download-resume-pdf.ts` after OTP verification.

1. Resume saved → `resumeId` returned
2. `POST /api/resumes/{id}/pdf`
3. Gotenberg loads preview URL and waits for `#resume-print-preview[data-resume-ready='true']`
4. PDF blob downloaded in browser

**Gotenberg options used:**

- `waitForSelector` — wait until resume HTML is ready
- `paperWidth` / `paperHeight` — A4 (8.27 × 11.7 in)
- `printBackground` — `true` (template colors)
- Zero margins

### Client-side (alternative)

`downloadResumePdf(containerId, displayName)` captures `#resume-print-preview` with **html2canvas-pro** + **jsPDF**. Available in codebase; finalize currently uses server PDF via Gotenberg.

### Print CSS

`app/globals.css` `@media print` hides all body content except `#resume-print-preview` when that element exists — used for clean print/PDF output.

---

## Phone verification & download

Component: `components/resume/download-pdf-verify-dialog.tsx`

### Steps

1. **Details** — confirm full name + phone from heading
2. **OTP** — 6-digit code via SMS (Job Media Provider)
3. **Success** — save resume + trigger PDF download

### Security

- **Google reCAPTCHA v3** on OTP request (`components/RecaptchaProvider.tsx`)
- Phone prefixed with `+88` for Bangladesh numbers when calling provider API

### Error UX

- Single **Download again** button in dialog footer on failure
- User-friendly error messages for save and PDF failures
- API errors surfaced from response JSON

---

## State management

### `useResumeDraft()` (`hooks/use-resume-draft.ts`)

- `useSyncExternalStore` over `localStorage`
- `patchDraft(partial)` — merge and save
- `replaceDraft(full)` — replace entire draft
- Dispatches `resume-draft-changed` event on save

### Storage key

```
jobmedia-resume-draft-v1
```

---

## Rate limiting

`lib/rate-limit.ts` — in-memory `Map` keyed by string (e.g. `ai-enhance-skills:192.168.1.1`).

- Default: **5 requests per hour** per IP per AI endpoint
- Returns `429` with `Retry-After` and `X-RateLimit-*` headers
- IP from `x-forwarded-for`, `x-real-ip`, or `cf-connecting-ip`

---

## Error handling

### AI errors (`lib/ai-errors.ts`)

Maps technical errors to user-friendly copy:

| Technical | User message |
|-----------|--------------|
| `fetch failed` / network | "The AI service is unavailable right now…" |
| Timeout / `AbortError` | "The AI request took too long…" |
| HTTP 429 | "You've reached the AI usage limit…" |
| HTTP 5xx | "The AI service is temporarily unavailable…" |
| Validation messages from API | Shown as-is |

Used in all three AI API routes and builder step components (`parseAiResponseJson`, `aiErrorFromResponse`, `toUserFacingAiError`).

### Ollama logging

`lib/ollama.ts` logs the configured `OLLAMA_BASE_URL` and model on failure for server-side debugging.

---

## Styling & print CSS

- **Tailwind CSS v4** with `@import "tailwindcss"` in `globals.css`
- **shadcn/ui** components in `components/ui/`
- **`.light-surface`** — forces light color tokens on fixed light backgrounds (builder, landing, dialogs)
- **Geist** font via `next/font`
- **ThemeProvider** (`next-themes`) in root layout

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Dev server with Turbopack |
| `pnpm run build` | Production build |
| `pnpm run start` | Start production server |
| `pnpm run typecheck` | `tsc --noEmit` |
| `pnpm run lint` | ESLint |
| `pnpm run format` | Prettier on `**/*.{ts,tsx}` |

---

## Database migrations

```bash
# Apply migrations (production)
npx prisma migrate deploy

# Generate client after schema changes
npx prisma generate

# Create new migration (development)
npx prisma migrate dev --name description
```

Prisma config: `prisma.config.ts` (loads `DATABASE_URL` from `.env`).

---

## Deployment notes

### Checklist

- [ ] Set `DATABASE_URL` (Neon or other PostgreSQL)
- [ ] Set `OLLAMA_BASE_URL` to a reachable Ollama instance (or disable AI if unavailable)
- [ ] Set `RESUME_PREVIEW_BASE_URL` to your public app URL (e.g. `https://cv.jobmedia.com.bd`)
- [ ] Configure `GOTENBERG_URL` (self-hosted recommended for production; demo instance has limits)
- [ ] Run `prisma migrate deploy`
- [ ] Ensure Gotenberg can reach `RESUME_PREVIEW_BASE_URL` from its network
- [ ] reCAPTCHA site key is in `RecaptchaProvider.tsx` (consider env var for production)

### Production PDF requirements

1. Deploy `/my-resume/preview/[id]/print` (server-rendered)
2. `RESUME_PREVIEW_BASE_URL` must be publicly accessible to Gotenberg
3. Same database as where resumes are saved

### AI in production

- Ollama must be reachable from the **Next.js server**, not the user's browser
- For serverless (Vercel), Ollama on a LAN IP will not work — use a hosted Ollama or separate AI service

---

## Troubleshooting

### AI: `fetch failed` / 502

- Ollama is not running or `OLLAMA_BASE_URL` is wrong
- Test: `curl $OLLAMA_BASE_URL/api/tags`
- Restart dev server after changing `.env`

### PDF downloads blank

- Gotenberg captured page before content loaded — use `/print` server page + `waitForSelector`
- Print CSS hid content — ensure `#resume-print-preview[data-resume-ready='true']` exists
- `RESUME_PREVIEW_BASE_URL` unreachable from Gotenberg (localhost won't work with remote Gotenberg)

### OTP not received

- Check Job Media Provider API availability
- Phone must be valid; prefixed with `+88` server-side
- reCAPTCHA must load (check browser console)

### Draft lost

- Draft is in `localStorage` only until saved via download flow
- Clearing browser data removes the draft

### Rate limit (429) on AI

- 5 requests/hour per IP per endpoint
- Wait for `Retry-After` or restart dev server (clears in-memory store)

---

## External services

| Service | URL / usage |
|---------|-------------|
| Job Media Provider | `https://provider.jobmedia.com.bd/api/account/download-permit/` |
| Job Media website | `https://jobmedia.com.bd` |
| Gotenberg (default) | `https://demo.gotenberg.dev` |
| Google reCAPTCHA v3 | Site key in `RecaptchaProvider.tsx` |
| Ollama | Configurable via `OLLAMA_BASE_URL` |

---

## License & ownership

Private project (`"private": true` in `package.json`). Built for Job Media resume builder product.

---

*Last updated: June 2026 — reflects codebase at `resume-builder` v0.0.1.*
