import { describe, expect, it } from "vitest";
import { scoreCandidate } from "./candidate-matching";
import { ApplicationRecord, Requisition } from "./recruitment";

const application: ApplicationRecord = {
  id: "APP-1001",
  jobId: "REQ-DESIGN",
  jobTitle: "Product Designer",
  name: "Ava Thompson",
  email: "ava@example.edu",
  phone: "555-0100",
  education: "B.A. Design, Northstar University",
  skills: "Figma, prototyping",
  experience: "4 years product design experience",
  projects: "Design system for a mobile product",
  certifications: "",
  resumeName: "ava-resume.pdf",
  coverLetter: "",
  supportingFiles: [],
  consent: true,
  submitted: "Today",
  cvStatus: "Ready for AI matching",
  cvNote: "",
};

const designJob: Requisition = {
  id: "REQ-DESIGN",
  title: "Product Designer",
  department: "Product",
  requester: "Dean",
  submitted: "Today",
  status: "Approved",
  vacancies: 1,
  justification: "Design a product.",
  skills: "Figma, prototyping",
  qualifications: "Bachelor’s degree in Design",
  experience: "3+ years",
};

const analystJob: Requisition = {
  ...designJob,
  id: "REQ-ANALYST",
  title: "Data Analyst",
  skills: "SQL, Python",
  qualifications: "Bachelor’s degree in Analytics",
  experience: "2+ years",
};

describe("scoreCandidate", () => {
  it("compares a candidate against the selected requisition’s requirements", () => {
    const designScore = scoreCandidate(application, designJob);
    const analystScore = scoreCandidate(application, analystJob);

    expect(designScore.matchedSkills).toEqual(["Figma", "prototyping"]);
    expect(designScore.missingSkills).toEqual([]);
    expect(designScore.score).toBeGreaterThan(analystScore.score);
    expect(analystScore.missingSkills).toEqual(["SQL", "Python"]);
  });
});
