import { describe, expect, it } from "vitest"

import {
  isHeadingContactValid,
  mergeResumeDraft,
  validateHeadingContact,
} from "@/lib/resume-draft"

const validContactBase = {
  givenName: "Jane",
  familyName: "Doe",
  profession: "Engineer",
  currentAddress: "House 12, Road 5",
  city: "Dhaka",
  postalCode: "1200",
  division: "Dhaka",
  dateOfBirth: "1995-01-15",
  gender: "female",
  phone: "01700000000",
  email: "not-an-email",
  photoDataUrl: null,
}

describe("resume-draft validation", () => {
  it("rejects invalid email formats", () => {
    const errors = validateHeadingContact(validContactBase)

    expect(errors.email).toBeDefined()
    expect(isHeadingContactValid(validContactBase)).toBe(false)
  })

  it("requires current address, date of birth, and gender", () => {
    const errors = validateHeadingContact({
      ...validContactBase,
      email: "jane@example.com",
      currentAddress: "",
      dateOfBirth: "",
      gender: "",
    })

    expect(errors.currentAddress).toBeDefined()
    expect(errors.dateOfBirth).toBeDefined()
    expect(errors.gender).toBeDefined()
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
          currentAddress: "",
          city: "",
          postalCode: "",
          division: "",
          dateOfBirth: "",
          gender: "",
          phone: "",
          email: "",
          photoDataUrl: null,
        },
        workHistory: [],
        education: [
          {
            id: "edu-1",
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
        ],
        trainings: [],
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

  it("mergeResumeDraft fills missing contact personal detail fields", () => {
    const merged = mergeResumeDraft(
      {
        id: "1",
        templateId: "classic",
        contact: {
          givenName: "",
          familyName: "",
          profession: "",
          currentAddress: "",
          city: "",
          postalCode: "",
          division: "",
          dateOfBirth: "",
          gender: "",
          phone: "",
          email: "",
          photoDataUrl: null,
        },
        workHistory: [],
        education: [],
        trainings: [],
        skills: [],
        languages: [],
        references: [],
        summary: "",
      },
      {
        contact: {
          givenName: "Ada",
          familyName: "Lovelace",
          profession: "Mathematician",
          city: "London",
          postalCode: "SW1",
          division: "Greater London",
          phone: "123",
          email: "ada@example.com",
          photoDataUrl: null,
        } as never,
      }
    )

    expect(merged.contact.currentAddress).toBe("")
    expect(merged.contact.dateOfBirth).toBe("")
    expect(merged.contact.gender).toBe("")
    expect(merged.contact.givenName).toBe("Ada")
  })
})
