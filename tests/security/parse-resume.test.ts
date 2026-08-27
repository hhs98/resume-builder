import { describe, expect, it } from "vitest"

import {
  buildParseResumePrompt,
  extractJsonFromAiResponse,
  getResumePdfPageLimitError,
  isResumePdfPageLimitMessage,
  MAX_RESUME_PDF_BYTES,
  MAX_RESUME_PDF_PAGES,
  normalizeParsedResume,
  validateResumePdfUpload,
} from "@/lib/parse-resume"

describe("parse-resume upload validation", () => {
  it("rejects non-file uploads", () => {
    const result = validateResumePdfUpload("not-a-file")
    expect(result).toEqual({ error: "Please upload a PDF resume file." })
  })

  it("rejects non-pdf extensions", () => {
    const file = new File(["hello"], "resume.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })

    const result = validateResumePdfUpload(file)
    expect(result).toEqual({ error: "Only PDF files are allowed." })
  })

  it("accepts valid pdf files by extension", () => {
    const file = new File(["%PDF-1.4"], "resume.pdf", {
      type: "application/pdf",
    })

    const result = validateResumePdfUpload(file)
    expect("file" in result).toBe(true)
  })

  it("rejects files larger than 5 MB", () => {
    const file = new File([new Uint8Array(MAX_RESUME_PDF_BYTES + 1)], "big.pdf", {
      type: "application/pdf",
    })

    const result = validateResumePdfUpload(file)
    expect(result).toMatchObject({ error: expect.stringContaining("too large") })
  })
})

describe("parse-resume page limits", () => {
  it("allows up to 5 pages", () => {
    expect(getResumePdfPageLimitError(5)).toBeNull()
    expect(getResumePdfPageLimitError(1)).toBeNull()
  })

  it("rejects more than 5 pages", () => {
    const error = getResumePdfPageLimitError(6)
    expect(error).toContain("6 pages")
    expect(error).toContain(`${MAX_RESUME_PDF_PAGES} pages`)
  })

  it("identifies page-limit errors for API handling", () => {
    const error = getResumePdfPageLimitError(10)!
    expect(isResumePdfPageLimitMessage(error)).toBe(true)
  })
})

describe("parse-resume AI JSON parsing", () => {
  it("includes user notes in the parse prompt when provided", () => {
    const prompt = buildParseResumePrompt(
      "Jane Doe software engineer",
      "Target a senior backend role and emphasize Node.js."
    )

    expect(prompt).toContain("Jane Doe software engineer")
    expect(prompt).toContain("Additional instructions from the user")
    expect(prompt).toContain("senior backend role")
  })

  it("extracts JSON from fenced markdown responses", () => {
    const parsed = extractJsonFromAiResponse(
      '```json\n{"contact":{"givenName":"Jane"},"summary":"Hi"}\n```'
    ) as { contact: { givenName: string } }

    expect(parsed.contact.givenName).toBe("Jane")
  })

  it("rejects responses without JSON object", () => {
    expect(() => extractJsonFromAiResponse("no json here")).toThrow(
      /valid resume data/i
    )
  })

  it("rejects malformed JSON", () => {
    expect(() => extractJsonFromAiResponse("{not valid json}")).toThrow(
      /unreadable resume data/i
    )
  })
})

describe("normalizeParsedResume security", () => {
  it("coerces unexpected types to safe strings (no script execution path)", () => {
    const draft = normalizeParsedResume({
      contact: {
        givenName: 12345,
        familyName: { evil: true },
        email: "test@example.com",
      },
      summary: ["array", "injection"],
      skills: [{ name: "<script>alert(1)</script>", rating: 99 }],
      languages: [{ name: "English", rating: 999 }],
      workHistory: [
        {
          jobTitle: "Dev",
          employer: "Co",
          responsibilities: "<img src=x onerror=alert(1)>",
          remote: "yes",
        },
      ],
      education: {
        degree: "not-a-real-degree",
        educationLevel: "fake-level",
        projectUrl: "javascript:alert(1)",
      },
    })

    expect(draft.contact.givenName).toBe("12345")
    expect(draft.contact.familyName).toBe("")
    expect(draft.summary).toBe("")
    expect(draft.skills[0]?.name).toBe("<script>alert(1)</script>")
    expect(draft.skills[0]?.rating).toBe(5)
    expect(draft.languages[0]?.rating).toBe(4)
    expect(draft.workHistory[0]?.remote).toBe(false)
    expect(draft.education[0]?.degree).toBe("")
    expect(draft.education[0]?.projectUrl).toBe("")
  })

  it("normalizes contact personal details and rejects invalid gender/dob", () => {
    const draft = normalizeParsedResume({
      contact: {
        givenName: "Jane",
        currentAddress: "  Road 10  ",
        dateOfBirth: "15/01/1995",
        gender: "unknown",
      },
    })

    expect(draft.contact.currentAddress).toBe("Road 10")
    expect(draft.contact.dateOfBirth).toBe("")
    expect(draft.contact.gender).toBe("")

    const valid = normalizeParsedResume({
      contact: {
        dateOfBirth: "1995-01-15",
        gender: "Female",
        currentAddress: "House 1",
      },
    })

    expect(valid.contact.dateOfBirth).toBe("1995-01-15")
    expect(valid.contact.gender).toBe("female")
    expect(valid.contact.currentAddress).toBe("House 1")
  })

  it("normalizes multiple education entries and caps at 3", () => {
    const draft = normalizeParsedResume({
      education: [
        {
          educationLevel: "bachelors",
          institution: "University A",
          degree: "bachelor",
        },
        {
          educationLevel: "masters-or-specialized",
          institution: "University B",
          degree: "master",
        },
        {
          educationLevel: "doctoral-or-jd",
          institution: "University C",
          degree: "doctorate",
        },
        {
          educationLevel: "associates",
          institution: "College D",
          degree: "associate",
        },
      ],
    })

    expect(draft.education).toHaveLength(3)
    expect(draft.education[0]?.institution).toBe("University A")
    expect(draft.education[2]?.institution).toBe("University C")
  })

  it("wraps a legacy single education object into an array", () => {
    const draft = normalizeParsedResume({
      education: {
        educationLevel: "bachelors",
        institution: "Legacy University",
        degree: "bachelor",
        projectUrl: "https://example.com/thesis",
      },
    })

    expect(draft.education).toHaveLength(1)
    expect(draft.education[0]?.institution).toBe("Legacy University")
    expect(draft.education[0]?.projectUrl).toBe("https://example.com/thesis")
  })

  it("does not crash on prototype pollution-style keys", () => {
    const malicious = JSON.parse(
      '{"contact":{"givenName":"Safe"},"__proto__":{"isAdmin":true}}'
    )

    const draft = normalizeParsedResume(malicious)
    expect(draft.contact.givenName).toBe("Safe")
    expect((draft as { isAdmin?: boolean }).isAdmin).toBeUndefined()
  })
})
