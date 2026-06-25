import { describe, expect, it } from "vitest"

import {
  isHeadingContactValid,
  mergeResumeDraft,
  validateHeadingContact,
} from "@/lib/resume-draft"

describe("resume-draft validation", () => {
  it("rejects invalid email formats", () => {
    const errors = validateHeadingContact({
      givenName: "Jane",
      familyName: "Doe",
      profession: "Engineer",
      city: "Dhaka",
      postalCode: "1200",
      division: "Dhaka",
      phone: "01700000000",
      email: "not-an-email",
      photoDataUrl: null,
    })

    expect(errors.email).toBeDefined()
    expect(isHeadingContactValid({
      givenName: "Jane",
      familyName: "Doe",
      profession: "Engineer",
      city: "Dhaka",
      postalCode: "1200",
      division: "Dhaka",
      phone: "01700000000",
      email: "not-an-email",
      photoDataUrl: null,
    })).toBe(false)
  })

  it("mergeResumeDraft does not deeply merge arrays from untrusted input", () => {
    const base = mergeResumeDraft(
      {
        id: "1",
        templateId: "classic",
        contact: {
          givenName: "",
          familyName: "",
          profession: "",
          city: "",
          postalCode: "",
          division: "",
          phone: "",
          email: "",
          photoDataUrl: null,
        },
        workHistory: [],
        education: {
          educationLevel: "",
          institution: "",
          institutionLocation: "",
          degree: "",
          fieldOfStudy: "",
          graduationMonth: "",
          graduationYear: "",
          description: "",
          projectUrl: "",
          gpa: "",
          awards: [],
        },
        skills: [],
        languages: [],
        references: [],
        summary: "",
      },
      {
        skills: [{ id: "injected", name: "Hacked", rating: 5 }],
      }
    )

    expect(base.skills).toHaveLength(1)
    expect(base.skills[0]?.name).toBe("Hacked")
  })
})
