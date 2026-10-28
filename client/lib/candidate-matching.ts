import { ApplicationRecord, Requisition } from "@/lib/recruitment";

export type MatchResult = {
  score: number;
  skills: number;
  experience: number;
  qualifications: number;
  matchedSkills: string[];
  missingSkills: string[];
  evidence: string[];
  calculatedAt: string;
};

function tokenize(value: string) {
  return value.split(/[,;|]/).map((item) => item.trim()).filter(Boolean);
}

function years(value: string) {
  return Number(value.match(/\d+(?:\.\d+)?/)?.[0] ?? 0);
}

export function scoreCandidate(application: ApplicationRecord, job: Requisition): MatchResult {
  const requiredSkills = tokenize(job.skills);
  const candidateSkills = `${application.skills}, ${application.projects}, ${application.certifications}`.toLowerCase();
  const matchedSkills = requiredSkills.filter((skill) => candidateSkills.includes(skill.toLowerCase()));
  const missingSkills = requiredSkills.filter((skill) => !matchedSkills.includes(skill));
  const skills = requiredSkills.length ? Math.round((matchedSkills.length / requiredSkills.length) * 100) : 50;
  const experience = job.experience ? Math.min(100, Math.round((years(application.experience) / Math.max(years(job.experience), 1)) * 100)) : 70;
  const qualificationKeywords = tokenize(job.qualifications ?? "").flatMap((item) => item.toLowerCase().split(/\s+/).filter((word) => word.length > 3 && !["degree", "related", "field", "preferred"].includes(word)));
  const candidateEducation = `${application.education} ${application.certifications}`.toLowerCase();
  const matchedQualification = qualificationKeywords.some((keyword) => candidateEducation.includes(keyword));
  const qualifications = qualificationKeywords.length ? (matchedQualification ? 100 : 55) : 70;
  const score = Math.round(skills * 0.5 + experience * 0.25 + qualifications * 0.25);
  const evidence = [
    application.skills ? `Skills on profile: ${application.skills}` : "Skills were not provided.",
    application.experience ? `Experience on profile: ${application.experience}` : "Experience information is missing.",
    application.education ? `Education on profile: ${application.education}` : "Education information is missing.",
  ];
  return { score, skills, experience, qualifications, matchedSkills, missingSkills, evidence, calculatedAt: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) };
}
