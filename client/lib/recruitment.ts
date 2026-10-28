export type ReqStatus = "Draft" | "Pending HR Approval" | "Returned for Correction" | "Approved" | "Rejected";
export type PostingStatus = "Draft" | "Published" | "Closed";
export type CVProcessingStatus = "Awaiting processing" | "In progress" | "Ready for AI matching" | "Rejected";

export type ApprovalEntry = {
  action: "Approved" | "Rejected" | "Returned for Correction" | "Resubmitted";
  actor: string;
  date: string;
  note: string;
};

export type Requisition = {
  id: string;
  title: string;
  department: string;
  requester: string;
  submitted: string;
  status: ReqStatus;
  vacancies: number;
  justification: string;
  skills: string;
  qualifications?: string;
  experience?: string;
  responsibilities?: string;
  employment?: string;
  salary?: string;
  joining?: string;
  location?: string;
  postingStatus?: PostingStatus;
  deadline?: string;
  approvalHistory?: ApprovalEntry[];
  reviewNote?: string;
};

export type CandidateDecision = "Shortlisted" | "On Hold" | "More Information Requested" | "Rejected";
export type CandidateDecisionEntry = { decision: CandidateDecision; actor: string; date: string; reason: string };
export type ContactEntry = { method: "Email" | "Phone" | "Message"; note: string; date: string; actor: string };
export type InterviewStatus = "Not scheduled" | "Scheduled" | "Attended" | "No-Show" | "Passed" | "Failed" | "On Hold" | "Closed · No-Show";
export type InterviewEntry = { date: string; type: "In-person" | "Video" | "Phone"; interviewer: string; status: InterviewStatus; feedback: string; createdAt: string };
export type OfferStatus = "Draft" | "Issued" | "Accepted" | "Declined" | "Withdrawn";
export type OfferHistoryEntry = { status: OfferStatus; actor: string; date: string; note: string };
export type OfferRecord = { status: OfferStatus; salary: string; startDate: string; expiresOn: string; generatedAt: string; issuedAt?: string; history: OfferHistoryEntry[] };

export type ApplicationRecord = {
  id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  education: string;
  skills: string;
  experience: string;
  projects: string;
  certifications: string;
  resumeName: string;
  coverLetter: string;
  supportingFiles: string[];
  consent: boolean;
  submitted: string;
  cvStatus: CVProcessingStatus;
  cvNote: string;
  matchHistory?: Array<{ score: number; skills: number; experience: number; qualifications: number; matchedSkills: string[]; missingSkills: string[]; evidence: string[]; calculatedAt: string }>;
  shortlistStatus?: CandidateDecision;
  inShortlisting?: boolean;
  rankAdjustment?: number;
  decisionHistory?: CandidateDecisionEntry[];
  rankAdjustmentHistory?: Array<{ note: string; actor: string; date: string }>;
  contactHistory?: ContactEntry[];
  interviewStatus?: InterviewStatus;
  interviewHistory?: InterviewEntry[];
  latestFeedback?: string;
  offer?: OfferRecord;
};

export type ApplicationInput = Omit<ApplicationRecord, "id" | "submitted" | "cvStatus" | "cvNote">;

export const seedRequisitions: Requisition[] = [
  { id: "REQ-2025-042", title: "Senior Product Designer", department: "Product & Design", requester: "Dr. Maya Chen", submitted: "Today, 9:42 AM", status: "Pending HR Approval", vacancies: 2, justification: "Expand the design team to support our upcoming platform redesign.", skills: "Figma, design systems, user research", qualifications: "Bachelor’s degree in Design or related field", experience: "5+ years", responsibilities: "Lead product design, research, and design systems.", employment: "Full-time", location: "Neotia University Campus · Hybrid", approvalHistory: [] },
  { id: "REQ-2025-041", title: "People Operations Partner", department: "Human Resources", requester: "James Wilson", submitted: "May 18, 2025", status: "Approved", vacancies: 1, justification: "Support growing hiring and employee experience programs.", skills: "Employee relations, HRIS, communication", qualifications: "Bachelor’s degree in Human Resources", experience: "3+ years", responsibilities: "Partner with teams on people programs and employee experience.", employment: "Full-time", location: "Neotia University Campus · Hybrid", postingStatus: "Published", deadline: "2025-07-15", approvalHistory: [{ action: "Approved", actor: "Morgan Carter", date: "May 19, 2025", note: "Approved as requested." }] },
  { id: "REQ-2025-040", title: "Data Analyst", department: "Technology", requester: "Dr. Maya Chen", submitted: "May 17, 2025", status: "Pending HR Approval", vacancies: 1, justification: "Improve reporting and operational decision-making.", skills: "SQL, Python, data visualization", qualifications: "Bachelor’s degree in Data Science or related field", experience: "2+ years", responsibilities: "Build reports and translate data into insights.", employment: "Full-time", location: "Neotia University Campus · On-site", approvalHistory: [] },
  { id: "REQ-2025-039", title: "Learning & Development Lead", department: "Academic Affairs", requester: "Prof. Owen Brooks", submitted: "May 15, 2025", status: "Returned for Correction", vacancies: 1, justification: "Build a consistent staff development program.", skills: "L&D, facilitation, instructional design", qualifications: "Master’s degree preferred", experience: "4+ years", responsibilities: "Develop staff learning programs and facilitate workshops.", employment: "Full-time", reviewNote: "Please clarify the scope and expected outcomes of the role.", approvalHistory: [{ action: "Returned for Correction", actor: "Morgan Carter", date: "May 16, 2025", note: "Please clarify the scope and expected outcomes of the role." }] },
  { id: "REQ-2025-038", title: "Research Coordinator", department: "Research", requester: "Prof. Nina Patel", submitted: "May 12, 2025", status: "Approved", vacancies: 3, justification: "Coordinate several newly funded research projects.", skills: "Research admin, compliance, organization", qualifications: "Bachelor’s degree in a related discipline", experience: "2+ years", responsibilities: "Coordinate timelines, documentation, and research operations.", employment: "Full-time", location: "Neotia Research Center", postingStatus: "Published", deadline: "2025-07-30", approvalHistory: [{ action: "Approved", actor: "Morgan Carter", date: "May 14, 2025", note: "Approved for the research team." }] },
];

const sampleNames = ["Ava Thompson", "Noah Williams", "Sofia Rodriguez", "Ethan Kim", "Mia Johnson", "Liam Patel", "Zoe Martinez", "Oliver Chen", "Amara Davis", "Leo Wilson", "Isla Brown", "Kai Nguyen"];

export const seedApplications: ApplicationRecord[] = Array.from({ length: 48 }, (_, index) => {
  const name = sampleNames[index % sampleNames.length];
  const job = index % 2 === 0 ? seedRequisitions[1] : seedRequisitions[4];
  const requiredSkills = job.skills.split(",").map((skill) => skill.trim());
  const candidateSkills = index % 4 === 0 ? job.skills : index % 4 === 1 ? requiredSkills[0] : index % 4 === 2 ? requiredSkills.slice(0, 2).join(", ") : "Communication, project management";
  const cvStatus: CVProcessingStatus = index < 8 ? "Awaiting processing" : index < 14 ? "In progress" : index < 17 ? "Rejected" : "Ready for AI matching";
  return {
    id: `APP-${String(108 - index).padStart(4, "0")}`,
    jobId: job.id,
    jobTitle: job.title,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, ".")}.${index + 1}@example.edu`,
    phone: `+1 (555) 01${String(index).padStart(2, "0")}`,
    education: index % 2 === 0 ? "B.A. Human Resources, The Neotia University" : "B.S. Research Administration, Westlake College",
    skills: candidateSkills,
    experience: `${2 + (index % 6)} years relevant experience`,
    projects: "Employee experience improvement initiative",
    certifications: index % 3 === 0 ? "SHRM-CP" : "",
    resumeName: index < 17 ? `${name.split(" ")[0].toLowerCase()}-resume.pdf` : "resume.pdf",
    coverLetter: "",
    supportingFiles: [],
    consent: true,
    submitted: index < 4 ? "Today" : `${index} days ago`,
    cvStatus,
    cvNote: cvStatus === "Rejected" ? "Document is unreadable or not a supported file type." : "",
    inShortlisting: [17, 18, 19, 20].includes(index),
    shortlistStatus: [17, 18].includes(index) ? "Shortlisted" : index === 20 ? "On Hold" : undefined,
    decisionHistory: [17, 18, 19, 20].includes(index) ? [{ decision: [17, 18].includes(index) ? "Shortlisted" : "On Hold", actor: "Morgan Carter", date: "May 19, 2025", reason: "Fictional demo HR review record." }] : [],
    interviewStatus: index === 18 ? "Scheduled" : index === 17 ? "Passed" : undefined,
    interviewHistory: index === 18 ? [{ date: "May 22, 2025, 10:30 AM", type: "Video", interviewer: "Morgan Carter", status: "Scheduled", feedback: "", createdAt: "May 19, 2025" }] : index === 17 ? [{ date: "May 21, 2025, 2:00 PM", type: "In-person", interviewer: "Morgan Carter", status: "Passed", feedback: "Strong role-specific experience and communication. Recommended to proceed.", createdAt: "May 19, 2025" }] : [],
    offer: index === 17 ? { status: "Draft", salary: "To be agreed", startDate: "", expiresOn: "", generatedAt: "May 21, 2025", history: [{ status: "Draft", actor: "Morgan Carter", date: "May 21, 2025", note: "Generated after interview pass." }] } : undefined,
  };
});

export function loadRequisitions(): Requisition[] {
  try {
    const value = localStorage.getItem("talentdesk-requisitions");
    if (value) return JSON.parse(value) as Requisition[];
  } catch {
    return seedRequisitions;
  }
  return seedRequisitions;
}

export function loadApplications(): ApplicationRecord[] {
  try {
    const value = localStorage.getItem("talentdesk-applications");
    if (value) return JSON.parse(value) as ApplicationRecord[];
  } catch {
    return seedApplications;
  }
  return seedApplications;
}
