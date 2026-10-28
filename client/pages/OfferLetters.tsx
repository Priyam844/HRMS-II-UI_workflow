import { FormEvent, useState } from "react";
import { Check, FileText, Printer, Send, ShieldAlert } from "lucide-react";
import { ApplicationRecord, OfferRecord, Requisition } from "@/lib/recruitment";

type OfferTerms = Pick<OfferRecord, "salary" | "startDate" | "expiresOn">;

function dateLabel(value: string) {
  if (!value) return "To be confirmed";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function OfferCard({ application, job, role, onUpdateOffer }: { application: ApplicationRecord; job?: Requisition; role: string; onUpdateOffer: (id: string, fields: Partial<OfferRecord>, status?: OfferRecord["status"], note?: string) => void }) {
  const offer = application.offer!;
  const [terms, setTerms] = useState<OfferTerms>({ salary: offer.salary, startDate: offer.startDate, expiresOn: offer.expiresOn });
  const [note, setNote] = useState("");
  const isHR = role === "HR Administrator";
  const saveTerms = () => onUpdateOffer(application.id, terms);
  const issue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onUpdateOffer(application.id, terms, "Issued");
  };
  const setStatus = (status: OfferRecord["status"]) => onUpdateOffer(application.id, terms, status, note.trim());
  return <article className="offer-card">
    <div className="offer-card-header"><div className="offer-candidate"><span className="offer-avatar">{application.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><h2>{application.name}</h2><p>{job?.title ?? application.jobTitle} · {application.id}</p><small><a className="contact-link" href={`mailto:${application.email}`}>{application.email}</a></small></div></div><span className={`status ${offer.status === "Accepted" ? "status-green" : offer.status === "Declined" || offer.status === "Withdrawn" ? "status-red" : offer.status === "Issued" ? "status-purple" : "status-amber"}`}><i/>{offer.status}</span></div>
    <div className="offer-card-body">
      <form className="offer-terms" onSubmit={issue}>
        <div className="offer-section-heading"><div><small>OFFER TERMS</small><strong>{offer.status === "Draft" ? "Review before issuing" : "Recorded terms"}</strong></div>{offer.status !== "Draft" && <button type="button" className="button-secondary offer-print-button" onClick={() => window.print()}><Printer size={14}/> Print</button>}</div>
        <label className="form-field"><span>Annual compensation</span><input disabled={!isHR || offer.status !== "Draft"} value={terms.salary} onChange={(event) => setTerms({ ...terms, salary: event.target.value })} placeholder="e.g. ₹9,50,000 per year"/></label>
        <div className="offer-dates"><label className="form-field"><span>Proposed start date</span><input type="date" required disabled={!isHR || offer.status !== "Draft"} value={terms.startDate} onChange={(event) => setTerms({ ...terms, startDate: event.target.value })}/></label><label className="form-field"><span>Offer expires</span><input type="date" required disabled={!isHR || offer.status !== "Draft"} value={terms.expiresOn} onChange={(event) => setTerms({ ...terms, expiresOn: event.target.value })}/></label></div>
        {offer.status === "Draft" && isHR && <div className="offer-actions"><button type="button" className="button-secondary" onClick={saveTerms}>Save draft</button><button className="button-primary" type="submit"><Send size={15}/> Issue offer</button></div>}
      </form>
      <section className="offer-letter-preview" aria-label="Offer letter preview"><div className="offer-letter-brand"><span className="offer-brand-mark">t</span><span><strong>TANDEM</strong><small>THE NEOTIA UNIVERSITY · PEOPLE & CULTURE</small></span><FileText size={20}/></div><div className="offer-letter-date">{offer.issuedAt ? `Issued ${offer.issuedAt}` : `Draft generated ${offer.generatedAt}`}</div><h3>Offer of Employment</h3><p>Dear {application.name.split(" ")[0]},</p><p>We are pleased to offer you the position of <strong>{job?.title ?? application.jobTitle}</strong> with <strong>{job?.department ?? "The Neotia University"}</strong>. We were impressed by your experience and interview, and look forward to the possibility of you joining our team.</p><div className="offer-detail-grid"><div><small>POSITION</small><strong>{job?.title ?? application.jobTitle}</strong></div><div><small>EMPLOYMENT</small><strong>{job?.employment ?? "Full-time"}</strong></div><div><small>ANNUAL COMPENSATION</small><strong>{terms.salary || "To be agreed"}</strong></div><div><small>PROPOSED START</small><strong>{dateLabel(terms.startDate)}</strong></div></div><p>This offer is subject to completion of applicable joining and employment verification. Please respond by <strong>{dateLabel(terms.expiresOn)}</strong>.</p><p>We look forward to welcoming you to The Neotia University.</p><div className="offer-signature"><span>Sincerely,</span><strong>Morgan Carter</strong><small>People & Culture · The Neotia University</small></div><div className="offer-candidate-response"><span>Candidate response</span><strong>{offer.status === "Accepted" ? "Accepted" : offer.status === "Declined" ? "Declined" : offer.status === "Issued" ? "Awaiting response" : "Not yet issued"}</strong></div></section>
    </div>
    {offer.status === "Issued" && isHR && <div className="offer-response-actions"><label className="form-field"><span>Response note (optional)</span><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Candidate response or follow-up note"/></label><div><button className="button-secondary" onClick={() => setStatus("Declined")}>Record declined</button><button className="button-primary" onClick={() => setStatus("Accepted")}><Check size={15}/> Record accepted</button></div></div>}
    {!isHR && <p className="offer-readonly-note"><ShieldAlert size={14}/> HR Administrator access is required to edit or issue offers.</p>}
    <div className="offer-history"><strong>Offer activity</strong>{offer.history.map((entry, index) => <div key={`${entry.date}-${entry.status}-${index}`}><span className="offer-history-dot"/><p><b>{entry.status}</b> · {entry.note}<small>{entry.actor} · {entry.date}</small></p></div>)}</div>
  </article>;
}

export function HiringOffersPage({ applications, requisitions, role, onUpdateOffer }: { applications: ApplicationRecord[]; requisitions: Requisition[]; role: string; onUpdateOffer: (id: string, fields: Partial<OfferRecord>, status?: OfferRecord["status"], note?: string) => void }) {
  const candidates = applications.filter((application) => application.interviewStatus === "Passed" && application.offer);
  const counts = { draft: candidates.filter((candidate) => candidate.offer?.status === "Draft").length, issued: candidates.filter((candidate) => candidate.offer?.status === "Issued").length, accepted: candidates.filter((candidate) => candidate.offer?.status === "Accepted").length };
  return <><div className="page-header"><div><div className="eyebrow">TALENT PIPELINE <span className="eyebrow-dot">/</span> FINAL SELECTION</div><h1>Hiring & offer letters</h1><p className="page-intro">Generate offer drafts for candidates who pass interviews, review terms, and track their response.</p></div><span className="approval-role-tag"><FileText size={16}/>{candidates.length} offer{candidates.length === 1 ? "" : "s"}</span></div><div className="matching-disclaimer"><ShieldAlert size={17}/><span><strong>Prototype workflow.</strong> Passing an interview creates a draft letter. HR must review and issue it; no email is sent and no employment agreement is legally executed by this demo.</span></div><div className="offer-metrics"><div><small>Drafts to review</small><strong>{counts.draft}</strong></div><div><small>Offers issued</small><strong>{counts.issued}</strong></div><div><small>Accepted</small><strong>{counts.accepted}</strong></div><div><small>Interview passes</small><strong>{applications.filter((application) => application.interviewStatus === "Passed").length}</strong></div></div>{candidates.length === 0 ? <div className="panel approvals-empty"><FileText size={24}/><h2>No offer drafts yet</h2><p>When HR records an interview outcome as Passed, a draft offer letter will be generated here.</p></div> : <div className="offer-list">{candidates.map((application) => <OfferCard key={application.id} application={application} job={requisitions.find((job) => job.id === application.jobId)} role={role} onUpdateOffer={onUpdateOffer}/>)}</div>}</>;
}
