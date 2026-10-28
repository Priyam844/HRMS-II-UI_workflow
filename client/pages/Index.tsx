import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ApplicationInput, ApplicationRecord, CandidateDecision, CVProcessingStatus, InterviewEntry, InterviewStatus, OfferRecord, Requisition, ReqStatus, loadApplications, loadRequisitions, seedRequisitions } from "@/lib/recruitment";
import { scoreCandidate } from "@/lib/candidate-matching";
import { ApplicationsPage, CVProcessingPage, JobPostingsPage, RequisitionApprovalsPage } from "./RecruitmentStages";
import { CandidateMatchingPage, CandidateShortlistingPage, HRInterviewsPage } from "./CandidatePipeline";
import { HiringOffersPage } from "./OfferLetters";
import {
  Activity, ArrowRight, ArrowUpRight, Bell, BriefcaseBusiness,
  CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight,
  ClipboardCheck, Clock3, FileText, Filter, LayoutDashboard, Menu, MoreHorizontal,
  Plus, Search, Settings2, Sparkles, Users, X, Building2,
  Inbox, FileCheck2, BadgeCheck, UserCheck, ShieldCheck, CircleDollarSign,
} from "lucide-react";

type Candidate = { id: string; name: string; role: string; stage: string; date: string; initials: string; color: string };

const navigation = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard, group: "WORKSPACE", description: "Your recruitment overview — open requisitions, pending approvals, applications, and hiring activity." },
  { label: "Job Requisitions", path: "/requisitions", icon: FileText, group: "WORKSPACE", description: "Create and track staffing requests from submission through HR approval." },
  { label: "Requisition Approvals", path: "/approvals", icon: ClipboardCheck, group: "WORKSPACE", description: "Review staffing requests independently before any job is posted." },
  { label: "Job Postings", path: "/postings", icon: BriefcaseBusiness, group: "TALENT PIPELINE", description: "View each approved requisition as a job poster and publish roles to applicants." },
  { label: "Applications", path: "/applications", icon: Inbox, group: "TALENT PIPELINE", description: "Explore open positions at The Neotia University and apply in a few steps." },
  { label: "CV Processing", path: "/cv-processing", icon: FileCheck2, group: "TALENT PIPELINE", description: "Review incoming resumes and validate candidate information before matching." },
  { label: "AI Candidate Matching", path: "/matching", icon: Sparkles, group: "TALENT PIPELINE", description: "Compare verified profiles against the exact role each candidate applied for." },
  { label: "Shortlisting & Ranking", path: "/shortlisting", icon: BadgeCheck, group: "TALENT PIPELINE", description: "Rank applicants within each job role and record HR's independent decision." },
  { label: "HR Interview & Contact", path: "/interviews", icon: Users, group: "TALENT PIPELINE", description: "Contact shortlisted applicants and manage interview schedules for each job role." },
  { label: "Hiring & Offer Letters", path: "/offers", icon: CircleDollarSign, group: "TALENT PIPELINE", description: "Generate, issue, and track offer letters for shortlisted candidates." },
];

const candidateSeed: Candidate[] = [
  { id: "APP-0108", name: "Ava Thompson", role: "Senior Product Designer", stage: "Interview", date: "Today, 10:30 AM", initials: "AT", color: "lavender" },
  { id: "APP-0107", name: "Noah Williams", role: "People Operations Partner", stage: "Shortlisted", date: "Today, 9:15 AM", initials: "NW", color: "mint" },
  { id: "APP-0106", name: "Sofia Rodriguez", role: "Data Analyst", stage: "CV review", date: "Yesterday", initials: "SR", color: "peach" },
  { id: "APP-0105", name: "Ethan Kim", role: "Research Coordinator", stage: "Offer sent", date: "May 19, 2025", initials: "EK", color: "blue" },
];

const stages = ["Applied", "CV review", "Matched", "Shortlisted", "Interview", "Offer"];
const demoEmployees = [{ id: "EMP-001" }, { id: "EMP-002" }];
const currentDate = () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const todayLine = () => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase();
const greeting = () => { const hour = new Date().getHours(); return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"; };
const initialForm = { title: "", department: "", vacancies: "1", qualifications: "", skills: "", experience: "", responsibilities: "", employment: "Full-time", salary: "", joining: "", justification: "", requester: "" };

function statusClass(status: string) {
  if (status === "Approved" || status === "Offer sent") return "status status-green";
  if (status === "Pending HR Approval" || status === "Interview") return "status status-purple";
  if (status === "Returned for Correction" || status === "CV review") return "status status-amber";
  if (status === "Rejected") return "status status-red";
  return "status status-gray";
}

function AppSidebar({ active, open, onClose, role, approvalCount, applicationCount }: { active: string; open: boolean; onClose: () => void; role: string; approvalCount: number; applicationCount: number }) {
  const groups = [...new Set(navigation.map((item) => item.group))];
  return <>
    {open && <button className="mobile-scrim" onClick={onClose} aria-label="Close navigation" />}
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="brand-lockup"><Link to="/" className="brand-link" aria-label="Tandem — back to dashboard"><div className="brand-icon"><span>t</span></div><div><strong>tandem</strong><small>PEOPLE & CULTURE</small></div></Link></div>
      <div className="workspace-select"><div className="workspace-mark"><Building2 size={16}/></div><div><strong>The Neotia University</strong><small>People workspace</small></div><ChevronDown size={15} className="workspace-chevron"/></div>
      <nav className="side-nav">
        {groups.map((group) => <div className="nav-group" key={group}><div className="nav-label">{group}</div>{navigation.filter((item) => item.group === group).map((item) => {
          const Icon = item.icon; const selected = active === item.path;
          return <Link key={item.path} to={item.path} onClick={onClose} className={`nav-link ${selected ? "nav-active" : ""}`}><Icon size={17} strokeWidth={selected ? 2.2 : 1.8}/><span>{item.label}</span>{(item.path === "/approvals" ? approvalCount : item.path === "/applications" ? applicationCount : 0) > 0 && <span className="nav-badge">{item.path === "/approvals" ? approvalCount : applicationCount}</span>}</Link>;
        })}</div>)}
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-user"><div className="avatar avatar-dark">MC</div><div className="sidebar-user-info"><strong>{role === "Department Dean" ? "Dr. Maya Chen" : "Morgan Carter"}</strong><small>{role}</small></div><MoreHorizontal size={19}/></div></div>
    </aside>
  </>;
}

function Topbar({ role, setRole, onMenu, notify }: { role: string; setRole: (role: string) => void; onMenu: () => void; notify: (message: string) => void }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const searchFor = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (!query) { notify("Type a requisition name, department, or requester to search."); return; }
    setSearchTerm("");
    navigate(`/requisitions?q=${encodeURIComponent(query)}`);
  };
  return <header className="topbar"><button className="mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu size={21}/></button><form className="topbar-search" onSubmit={searchFor}><Search size={17}/><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search requisitions…" aria-label="Search requisitions"/></form><div className="topbar-actions"><button className="icon-button notification-button" aria-label="Notifications" onClick={() => notify("No new notifications — you're all caught up.")}><Bell size={19}/></button><span className="topbar-divider"/><div className="role-switch"><span>View as</span><select value={role} onChange={(event) => setRole(event.target.value)} aria-label="Demo role"><option>HR Administrator</option><option>Department Dean</option><option>Candidate</option></select><ChevronDown size={13}/></div><div className="avatar avatar-top">MC</div></div></header>;
}

function MetricCard({ label, value, change, icon: Icon, tone, note }: { label: string; value: string | number; change: string; icon: typeof Users; tone: string; note: string }) {
  return <div className="metric-card"><div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone}`}><Icon size={18}/></span></div><div className="metric-number-row"><strong>{value}</strong><span className="metric-change"><ArrowUpRight size={13}/>{change}</span></div><div className="metric-note">{note}</div></div>;
}

function Dashboard({ requisitions, applications, role, onCreate }: { requisitions: Requisition[]; applications: ApplicationRecord[]; role: string; onCreate: () => void }) {
  const pending = requisitions.filter((req) => req.status === "Pending HR Approval").length;
  const openReq = requisitions.filter((req) => req.status === "Approved" || req.status === "Pending HR Approval").length;
  const published = requisitions.filter((req) => req.status === "Approved" && req.postingStatus === "Published").length;
  const awaiting = applications.filter((application) => application.cvStatus === "Awaiting processing").length;
  const inProgress = applications.filter((application) => application.cvStatus === "In progress").length;
  const readyForMatching = applications.filter((application) => application.cvStatus === "Ready for AI matching").length;
  const shortlisted = applications.filter((application) => application.shortlistStatus === "Shortlisted").length;
  const interviewsScheduled = applications.filter((application) => application.interviewStatus === "Scheduled").length;
  const metrics = [
    { label: "Open requisitions", value: openReq, change: "+2", icon: BriefcaseBusiness, tone: "metric-purple", note: "Across 4 departments" },
    { label: "Pending approvals", value: pending, change: "+1", icon: ClipboardCheck, tone: "metric-orange", note: "Needs your attention" },
    { label: "Published vacancies", value: published, change: "+1", icon: Building2, tone: "metric-blue", note: "Currently accepting applications" },
    { label: "Total applications", value: applications.length, change: "+12%", icon: Users, tone: "metric-green", note: "Across published roles" },
  ];
  const funnelCounts = [applications.length, awaiting + inProgress + readyForMatching, readyForMatching, shortlisted, interviewsScheduled, 0];
  const pipelineMetrics = [
    { label: "CVs awaiting processing", value: awaiting, icon: FileCheck2, tone: "metric-orange" },
    { label: "Candidates shortlisted", value: shortlisted, icon: BadgeCheck, tone: "metric-purple" },
    { label: "Interviews scheduled", value: interviewsScheduled, icon: CalendarDays, tone: "metric-blue" },
    { label: "Offers issued", value: funnelCounts[5], icon: FileText, tone: "metric-green" },
    { label: "Employees created", value: demoEmployees.length, icon: UserCheck, tone: "metric-purple" },
  ];
  return <>
    <div className="welcome-row"><div><div className="eyebrow">{todayLine()} <span className="eyebrow-dot">·</span> YOUR RECRUITMENT OVERVIEW</div><h1>{greeting()}, {role === "Department Dean" ? "Maya" : "Morgan"} <span className="wave">✳</span></h1><p className="page-intro">Here’s what’s happening across your hiring pipeline today.</p></div><button className="button-primary" onClick={onCreate}><Plus size={17}/> Create requisition</button></div>
    <div className="metric-grid">{metrics.map((item) => <MetricCard key={item.label} {...item}/>)}</div>
    <div className="pipeline-metrics">{pipelineMetrics.map(({ label, value, icon: Icon, tone }) => <div className="pipeline-metric" key={label}><span className={`pipeline-icon ${tone}`}><Icon size={15}/></span><span><small>{label}</small><strong>{value}</strong></span></div>)}</div>
    <div className="dashboard-grid">
      <section className="panel funnel-panel"><div className="panel-heading"><div><h2>Recruitment funnel</h2><p>Candidate journey across all open roles · last 30 days</p></div></div><div className="funnel-content"><div className="funnel-chart">{stages.map((stage, index) => <div className="funnel-row" key={stage}><span className="funnel-stage">{stage}</span><div className="funnel-track"><div className={`funnel-fill funnel-fill-${index}`} style={{ width: `${funnelCounts[index] / funnelCounts[0] * 100}%` }} /></div><strong>{funnelCounts[index]}</strong><small>{index === 0 ? "100%" : `${Math.round(funnelCounts[index] / funnelCounts[0] * 100)}%`}</small></div>)}</div><div className="funnel-foot"><span><span className="legend-dot"/>Candidates this month</span><span>{applications.length} total <ArrowRight size={13}/></span></div></div></section>
      <section className="panel activity-panel"><div className="panel-heading"><div><h2>Application activity</h2><p>Applications received over time · this week</p></div></div><div className="chart-legend"><span><i className="legend-dot violet-dot"/>Applications</span><strong>{applications.length} <small><ArrowUpRight size={12}/> 12%</small></strong></div><div className="bar-chart"><div className="chart-y-labels"><span>20</span><span>15</span><span>10</span><span>5</span><span>0</span></div><div className="chart-bars">{[{d:"Mon",n:8},{d:"Tue",n:14},{d:"Wed",n:10},{d:"Thu",n:17},{d:"Fri",n:12},{d:"Sat",n:5},{d:"Sun",n:8}].map((bar, index) => <div className="chart-bar-wrap" key={bar.d}><div className={`chart-bar ${index === 3 ? "chart-bar-active" : ""}`} style={{height:`${bar.n * 5.5}px`}}><span>{bar.n}</span></div><small>{bar.d}</small></div>)}</div></div></section>
    </div>
    <div className="dashboard-grid bottom-grid">
      <section className="panel candidates-panel"><div className="panel-heading"><div><h2>Recent candidates</h2><p>Keep up with your latest applicants</p></div><Link className="text-link" to="/applications">View all <ArrowRight size={14}/></Link></div><div className="candidate-list">{candidateSeed.map((candidate) => <div className="candidate-row" key={candidate.id}><div className={`avatar avatar-${candidate.color}`}>{candidate.initials}</div><div className="candidate-main"><strong>{candidate.name}</strong><small>{candidate.role} <span>·</span> {candidate.id}</small></div><span className={statusClass(candidate.stage)}>{candidate.stage}</span><span className="candidate-date">{candidate.date}</span></div>)}</div></section>
      <section className="panel activity-feed"><div className="panel-heading"><div><h2>Recent activity</h2><p>Latest updates from your team</p></div></div><div className="feed-list"><div className="feed-item"><div className="feed-icon feed-purple"><Check size={15}/></div><div><p><strong>James Wilson</strong> approved a requisition</p><small>People Operations Partner <span>·</span> 12 min ago</small></div></div><div className="feed-item"><div className="feed-icon feed-blue"><Users size={15}/></div><div><p><strong>12 new applications</strong> came in</p><small>Senior Product Designer <span>·</span> 1 hour ago</small></div></div><div className="feed-item"><div className="feed-icon feed-orange"><CalendarDays size={15}/></div><div><p>Interview scheduled with <strong>Ava Thompson</strong></p><small>Product Designer <span>·</span> 2 hours ago</small></div></div><div className="feed-item"><div className="feed-icon feed-green"><FileText size={15}/></div><div><p><strong>New requisition</strong> submitted for review</p><small>Data Analyst <span>·</span> 3 hours ago</small></div></div></div><Link to="/applications" className="activity-footer">Review applications <ArrowRight size={14}/></Link></section>
    </div>
    <div className="quick-actions"><div className="quick-copy"><span className="quick-spark"><Sparkles size={17}/></span><div><strong>Keep your hiring moving</strong><small>Pick up where your team left off.</small></div></div><Link to="/approvals" className="quick-action"><span className="quick-action-icon quick-orange"><ClipboardCheck size={17}/></span><span><strong>{pending} requisitions</strong><small>awaiting your review</small></span><ArrowRight size={15}/></Link><Link to="/interviews" className="quick-action"><span className="quick-action-icon quick-blue"><CalendarDays size={17}/></span><span><strong>{interviewsScheduled} interviews</strong><small>scheduled this week</small></span><ArrowRight size={15}/></Link><Link to="/cv-processing" className="quick-action"><span className="quick-action-icon quick-green"><FileCheck2 size={17}/></span><span><strong>{awaiting} CVs</strong><small>ready for processing</small></span><ArrowRight size={15}/></Link></div>
  </>;
}

function RequisitionPage({ requisitions, onCreate, onEdit }: { requisitions: Requisition[]; onCreate: () => void; onEdit: (request: Requisition) => void }) {
  const [params] = useSearchParams();
  const queryFromUrl = params.get("q") ?? "";
  const [filter, setFilter] = useState("All requisitions");
  const [search, setSearch] = useState(queryFromUrl);
  useEffect(() => { setSearch(queryFromUrl); }, [queryFromUrl]);
  const filtered = requisitions.filter((req) => (filter === "All requisitions" || req.status === filter) && `${req.title} ${req.department} ${req.requester} ${req.id}`.toLowerCase().includes(search.toLowerCase()));
  return <><div className="page-header"><div><div className="eyebrow">WORKSPACE <span className="eyebrow-dot">/</span> HIRING REQUESTS</div><h1>Job requisitions</h1><p className="page-intro">Create and track staffing requests from submission through HR approval.</p></div><button className="button-primary" onClick={onCreate}><Plus size={17}/> New requisition</button></div><div className="requisition-summary"><div><span className="summary-icon summary-purple"><BriefcaseBusiness size={18}/></span><span><small>Total requisitions</small><strong>{requisitions.length}</strong></span></div><div><span className="summary-icon summary-orange"><Clock3 size={18}/></span><span><small>Pending review</small><strong>{requisitions.filter((r) => r.status === "Pending HR Approval").length}</strong></span></div><div><span className="summary-icon summary-green"><Check size={18}/></span><span><small>Approved</small><strong>{requisitions.filter((r) => r.status === "Approved").length}</strong></span></div><div className="summary-caption"><Activity size={16}/> Requests need HR approval before posting</div></div><section className="panel req-table-panel"><div className="req-toolbar"><div className="filter-tabs">{["All requisitions", "Pending HR Approval", "Approved", "Returned for Correction", "Rejected", "Draft"].map((status) => <button key={status} onClick={() => setFilter(status)} className={filter === status ? "filter-tab active-tab" : "filter-tab"}>{status}{status === "Pending HR Approval" && <i>{requisitions.filter((r) => r.status === status).length}</i>}</button>)}</div><div className="table-tools"><label className="table-search"><Search size={15}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search requisitions"/></label><button className="filter-button" onClick={() => setFilter(filter === "All requisitions" ? "Pending HR Approval" : "All requisitions")}><Filter size={15}/>{filter === "Pending HR Approval" ? "Show all" : "Pending only"}</button></div></div><div className="table-scroll"><table className="req-table"><thead><tr><th>JOB TITLE</th><th>DEPARTMENT</th><th>REQUESTED BY</th><th>SUBMITTED</th><th>VACANCIES</th><th>STATUS</th><th/></tr></thead><tbody>{filtered.map((req) => <tr key={req.id}><td><div className="job-title-cell"><span className="job-icon"><BriefcaseBusiness size={16}/></span><span><strong>{req.title}</strong><small>{req.id}</small></span></div></td><td>{req.department}</td><td><div className="requester-cell"><span className="avatar avatar-mini">{req.requester.split(" ").map((w) => w[0]).slice(0,2).join("")}</span>{req.requester}</div></td><td>{req.submitted}</td><td>{req.vacancies} {req.vacancies === 1 ? "position" : "positions"}</td><td><span className={statusClass(req.status)}><i/>{req.status}</span></td><td>{(req.status === "Returned for Correction" || req.status === "Draft") ? <button className="text-link req-edit-action" onClick={() => onEdit(req)}>{req.status === "Draft" ? "Edit draft" : "Edit & resubmit"}</button> : <button className="row-more" aria-label={`Open ${req.title}`}><MoreHorizontal size={18}/></button>}</td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-state"><Search size={23}/><strong>No requisitions found</strong><span>Try changing your search or status filter.</span></div>}</div><div className="table-footer"><span>Showing <strong>{filtered.length}</strong> of <strong>{requisitions.length}</strong> requisitions</span><div><button className="pagination-button" disabled><ChevronLeft size={15}/></button><button className="pagination-page">1</button><button className="pagination-button" disabled><ChevronRight size={15}/></button></div></div></section><div className="workflow-note"><span><ShieldCheck size={16}/></span><p><strong>Approval stays in HR’s hands.</strong> Submitted requests are reviewed by HR before they can become job postings. The requester cannot approve their own requisition.</p></div></>;
}

function Placeholder({ title }: { title: string }) {
  const active = navigation.find((item) => item.label === title);
  const Icon = active?.icon ?? Settings2;
  return <div className="placeholder-page"><span className="placeholder-icon"><Icon size={24}/></span><div className="eyebrow">RECRUITMENT WORKSPACE</div><h1>{title}</h1><p>This stage of the recruitment workflow is being prepared. In the meantime, follow your pipeline from requisition through approval to hiring.</p><div className="placeholder-workflow"><span>Requisition</span><ArrowRight size={14}/><span>Approval</span><ArrowRight size={14}/><span>Hiring pipeline</span></div><Link to="/" className="button-secondary"><LayoutDashboard size={16}/> Back to dashboard</Link></div>;
}

function RequisitionModal({ onClose, onSave, role, requisition }: { onClose: () => void; onSave: (form: typeof initialForm, status: ReqStatus, id?: string) => void; role: string; requisition?: Requisition }) {
  const [form, setForm] = useState(() => requisition ? { ...initialForm, title: requisition.title, department: requisition.department, vacancies: String(requisition.vacancies), qualifications: requisition.qualifications ?? "", skills: requisition.skills, experience: requisition.experience ?? "", responsibilities: requisition.responsibilities ?? "", employment: requisition.employment ?? "Full-time", salary: requisition.salary ?? "", joining: requisition.joining ?? "", justification: requisition.justification, requester: requisition.requester } : initialForm);
  const [error, setError] = useState("");
  const update = (key: keyof typeof initialForm, value: string) => setForm((previous) => ({ ...previous, [key]: value }));
  const save = (status: ReqStatus) => {
    if (role !== "Department Dean") { setError("Only a Department Dean can create a requisition in this demo. Switch your demo role to continue."); return; }
    if (status !== "Draft" && (!form.title.trim() || !form.department.trim() || !form.justification.trim())) { setError("Add a job title, department, and business justification before submitting."); return; }
    onSave({ ...form, requester: form.requester || "Dr. Maya Chen" }, status, requisition?.id);
  };
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="requisition-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><span className="modal-kicker">NEW HIRING REQUEST</span><h2 id="modal-title">{requisition ? "Edit requisition" : "Create a requisition"}</h2><p>Tell us what your team needs. HR will review before any role is published.</p></div><button onClick={onClose} className="icon-button close-modal" aria-label="Close"><X size={19}/></button></div><div className="modal-body"><div className="form-grid"><label className="form-field span-2"><span>Job title / designation <b>*</b></span><input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Senior Product Designer"/></label><label className="form-field"><span>Department <b>*</b></span><input value={form.department} onChange={(e) => update("department", e.target.value)} placeholder="e.g. Product & Design"/></label><label className="form-field"><span>Number of vacancies</span><input type="number" min="1" value={form.vacancies} onChange={(e) => update("vacancies", e.target.value)}/></label><label className="form-field"><span>Required qualifications</span><input value={form.qualifications} onChange={(e) => update("qualifications", e.target.value)} placeholder="Degree, certifications..."/></label><label className="form-field"><span>Required skills</span><input value={form.skills} onChange={(e) => update("skills", e.target.value)} placeholder="Separate skills with commas"/></label><label className="form-field"><span>Minimum experience</span><input value={form.experience} onChange={(e) => update("experience", e.target.value)} placeholder="e.g. 3+ years"/></label><label className="form-field"><span>Employment type</span><select value={form.employment} onChange={(e) => update("employment", e.target.value)}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Temporary</option></select></label><label className="form-field span-2"><span>Job responsibilities</span><textarea value={form.responsibilities} onChange={(e) => update("responsibilities", e.target.value)} placeholder="Outline the key responsibilities..." rows={2}/></label><label className="form-field"><span>Salary range / budget</span><input value={form.salary} onChange={(e) => update("salary", e.target.value)} placeholder="e.g. ₹8,00,000 – ₹10,00,000"/></label><label className="form-field"><span>Preferred joining date</span><input type="date" value={form.joining} onChange={(e) => update("joining", e.target.value)}/></label><label className="form-field span-2"><span>Business justification <b>*</b></span><textarea value={form.justification} onChange={(e) => update("justification", e.target.value)} placeholder="Why is this role needed?" rows={3}/></label></div>{error && <div className="form-error">{error}</div>}<div className="approval-hint"><ShieldCheck size={17}/><span>Submitting routes this request to HR for independent review. It will not publish automatically.</span></div></div><div className="modal-footer"><span className="required-note"><b>*</b> Required to submit</span><div><button className="button-secondary" onClick={() => save("Draft")}>Save draft</button><button className="button-primary" onClick={() => save("Pending HR Approval")}>{requisition ? "Resubmit for approval" : "Submit for approval"} <ArrowRight size={15}/></button></div></div></div></div>;
}

export default function Index() {
  const location = useLocation();
  const [requisitions, setRequisitions] = useState<Requisition[]>(loadRequisitions);
  const [applications, setApplications] = useState<ApplicationRecord[]>(loadApplications);
  const [role, setRole] = useState(() => localStorage.getItem("talentdesk-role-v2") || "Department Dean");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Requisition | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");
  const page = navigation.find((item) => item.path === location.pathname) ?? navigation[0];
  useEffect(() => {
    const isKnown = navigation.some((item) => item.path === location.pathname);
    const label = isKnown ? page.label : "Recruitment workspace";
    document.title = `${label} · Tandem — Recruitment & Selection`;
    const description = isKnown ? page.description : "This stage of the recruitment workflow is being prepared.";
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [location.pathname, page.label, page.description]);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3500); };
  const saveRequisitions = (updated: Requisition[]) => { setRequisitions(updated); localStorage.setItem("talentdesk-requisitions", JSON.stringify(updated)); };
  const saveApplications = (updated: ApplicationRecord[]) => { setApplications(updated); localStorage.setItem("talentdesk-applications", JSON.stringify(updated)); };
  const selectRole = (newRole: string) => { setRole(newRole); localStorage.setItem("talentdesk-role-v2", newRole); };
  const beginCreate = () => {
    if (role !== "Department Dean") { notify("Switch the demo role to Department Dean to create a requisition."); return; }
    setModalOpen(true);
  };
  const editRequisition = (request: Requisition) => {
    if (role !== "Department Dean") { notify("Switch the demo role to Department Dean to edit this request."); return; }
    setEditingRequest(request);
    setModalOpen(true);
  };
  const saveRequisition = (form: typeof initialForm, status: ReqStatus, id?: string) => {
    if (role !== "Department Dean") { notify("Only a Department Dean can submit a requisition."); return; }
    const next: Requisition = { id: id ?? `REQ-2025-${String(43 + requisitions.length - seedRequisitions.length).padStart(3, "0")}`, title: form.title || "Untitled requisition", department: form.department || "Unassigned", requester: form.requester, submitted: status === "Draft" ? "Draft saved just now" : "Just now", status, vacancies: Number(form.vacancies) || 1, justification: form.justification, skills: form.skills, qualifications: form.qualifications, experience: form.experience, responsibilities: form.responsibilities, employment: form.employment, salary: form.salary, joining: form.joining, approvalHistory: id ? requisitions.find((request) => request.id === id)?.approvalHistory ?? [] : [] };
    const updated = id ? requisitions.map((request) => request.id === id ? next : request) : [next, ...requisitions];
    saveRequisitions(updated); setModalOpen(false); setEditingRequest(null); notify(status === "Draft" ? "Draft saved" : "Requisition submitted for HR approval");
  };
  const decideRequisition = (id: string, decision: "Approved" | "Rejected" | "Returned for Correction", note: string) => {
    if (role !== "HR Administrator") { notify("Switch the demo role to HR Administrator to review requisitions."); return; }
    if (decision !== "Approved" && !note.trim()) { notify("Add a review note before rejecting or returning a requisition."); return; }
    const updated = requisitions.map((request) => request.id !== id ? request : { ...request, status: decision, reviewNote: note.trim(), approvalHistory: [...(request.approvalHistory ?? []), { action: decision, actor: "Morgan Carter", date: currentDate(), note: note.trim() }] });
    saveRequisitions(updated); notify(`Requisition ${decision.toLowerCase()}.`);
  };
  const changePosting = (id: string, status: "Published" | "Closed" | "Draft") => {
    if (role !== "HR Administrator") { notify("Only HR can publish or close job postings."); return; }
    saveRequisitions(requisitions.map((request) => request.id === id ? { ...request, postingStatus: status } : request));
    notify(status === "Published" ? "Job published to the Applications page." : `Job posting ${status.toLowerCase()}.`);
  };
  const submitApplication = (application: ApplicationInput) => {
    if (applications.some((item) => item.jobId === application.jobId && item.email.toLowerCase() === application.email.toLowerCase())) return "You have already applied to this vacancy with this email address.";
    const next: ApplicationRecord = { ...application, id: `APP-${Date.now().toString().slice(-8)}`, submitted: "Just now", cvStatus: "Awaiting processing", cvNote: "" };
    saveApplications([next, ...applications]);
    notify(`Application ${next.id} submitted successfully.`);
    return next.id;
  };
  const changeCVStatus = (id: string, status: CVProcessingStatus, note = "") => {
    if (role !== "HR Administrator") { notify("Switch the demo role to HR Administrator to review CVs."); return; }
    saveApplications(applications.map((application) => application.id === id ? { ...application, cvStatus: status, cvNote: note } : application));
    notify(status === "Ready for AI matching" ? "Verified profile moved to AI Candidate Matching." : `CV status updated: ${status}.`);
  };
  const sendToShortlisting = (application: ApplicationRecord, job: Requisition) => {
    if (role !== "HR Administrator") { notify("Switch to HR Administrator to send candidates for HR ranking."); return; }
    const result = scoreCandidate(application, job);
    saveApplications(applications.map((item) => item.id === application.id ? { ...item, inShortlisting: true, matchHistory: [...(item.matchHistory ?? []), result], shortlistStatus: undefined } : item));
    notify(`${application.name} added to the ${job.title} ranking list.`);
  };
  const decideCandidate = (id: string, decision: CandidateDecision, reason: string) => {
    if (role !== "HR Administrator") { notify("Switch to HR Administrator to record shortlist decisions."); return; }
    if (!reason.trim()) { notify("Add a decision reason before updating the shortlist."); return; }
    saveApplications(applications.map((application) => application.id === id ? { ...application, shortlistStatus: decision, decisionHistory: [...(application.decisionHistory ?? []), { decision, actor: "Morgan Carter", date: currentDate(), reason: reason.trim() }] } : application));
    notify(`${applicationName(id)} marked ${decision.toLowerCase()}.`);
  };
  const adjustCandidateRank = (id: string, direction: -1 | 1, reason: string) => {
    if (role !== "HR Administrator") { notify("Switch to HR Administrator to adjust ranking."); return; }
    if (!reason.trim()) { notify("Add a reason to preserve the ranking history."); return; }
    saveApplications(applications.map((application) => application.id === id ? { ...application, rankAdjustment: (application.rankAdjustment ?? 0) + direction, rankAdjustmentHistory: [...(application.rankAdjustmentHistory ?? []), { note: `${direction > 0 ? "Raised" : "Lowered"} one ranking point: ${reason.trim()}`, actor: "Morgan Carter", date: currentDate() }] } : application));
    notify("Manual ranking adjustment saved.");
  };
  const logContact = (id: string, method: "Email" | "Phone" | "Message", note: string) => {
    if (role !== "HR Administrator") { notify("Switch to HR Administrator to contact applicants."); return; }
    saveApplications(applications.map((application) => application.id === id ? { ...application, contactHistory: [...(application.contactHistory ?? []), { method, note, date: currentDate(), actor: "Morgan Carter" }] } : application));
    notify(`${method} contact recorded in application history. No message was sent.`);
  };
  const scheduleInterview = (id: string, interview: Omit<InterviewEntry, "createdAt" | "status">) => {
    if (role !== "HR Administrator") { notify("Switch to HR Administrator to schedule interviews."); return; }
    saveApplications(applications.map((application) => application.id === id ? { ...application, interviewStatus: "Scheduled", interviewHistory: [...(application.interviewHistory ?? []), { ...interview, status: "Scheduled", createdAt: currentDate() }] } : application));
    notify("Interview scheduled. Previous interview records are preserved.");
  };
  const updateInterviewStatus = (id: string, status: InterviewStatus, feedback: string) => {
    if (role !== "HR Administrator") { notify("Switch to HR Administrator to update interview outcomes."); return; }
    saveApplications(applications.map((application) => {
      if (application.id !== id) return application;
      const latest = application.interviewHistory?.[application.interviewHistory.length - 1];
      const entry: InterviewEntry | null = latest ? { ...latest, status, feedback, createdAt: currentDate() } : null;
      const requisition = requisitions.find((request) => request.id === application.jobId);
      const generatedOn = currentDate();
      const expiresOn = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const offer = status === "Passed" && !application.offer && requisition ? { status: "Draft" as const, salary: requisition.salary || "To be agreed", startDate: requisition.joining || "", expiresOn, generatedAt: generatedOn, history: [{ status: "Draft" as const, actor: "Morgan Carter", date: generatedOn, note: "Generated after interview pass." }] } : application.offer;
      return { ...application, interviewStatus: status, latestFeedback: feedback, interviewHistory: entry ? [...(application.interviewHistory ?? []), entry] : application.interviewHistory ?? [], offer };
    }));
    notify(status === "Passed" ? "Interview passed. An offer letter draft was generated for HR review." : `Interview outcome recorded: ${status}.`);
  };
  const updateOffer = (id: string, fields: Partial<OfferRecord>, status?: OfferRecord["status"], note = "") => {
    if (role !== "HR Administrator") { notify("Switch to HR Administrator to manage offer letters."); return; }
    saveApplications(applications.map((application) => {
      if (application.id !== id || !application.offer) return application;
      const nextStatus = status ?? application.offer.status;
      const changedStatus = nextStatus !== application.offer.status;
      const termsChanged = fields.salary !== undefined || fields.startDate !== undefined || fields.expiresOn !== undefined;
      const history = changedStatus || termsChanged ? [...application.offer.history, { status: nextStatus, actor: "Morgan Carter", date: currentDate(), note: note || (changedStatus ? `Offer ${nextStatus.toLowerCase()}.` : "Offer terms reviewed and updated.") }] : application.offer.history;
      return { ...application, offer: { ...application.offer, ...fields, status: nextStatus, issuedAt: nextStatus === "Issued" ? currentDate() : application.offer.issuedAt, history } };
    }));
    notify(status ? `Offer ${status.toLowerCase()} and saved.` : "Offer terms saved.");
  };
  const applicationName = (id: string) => applications.find((application) => application.id === id)?.name ?? "Candidate";
  const pageContent = location.pathname === "/" ? <Dashboard requisitions={requisitions} applications={applications} role={role} onCreate={beginCreate}/> : location.pathname === "/requisitions" ? <RequisitionPage requisitions={requisitions} onCreate={beginCreate} onEdit={editRequisition}/> : location.pathname === "/approvals" ? <RequisitionApprovalsPage requisitions={requisitions} role={role} onDecision={decideRequisition}/> : location.pathname === "/postings" ? <JobPostingsPage requisitions={requisitions} role={role} onPostingChange={changePosting}/> : location.pathname === "/applications" ? <ApplicationsPage requisitions={requisitions} applications={applications} onApply={submitApplication}/> : location.pathname === "/cv-processing" ? <CVProcessingPage applications={applications} role={role} onStatusChange={changeCVStatus}/> : location.pathname === "/matching" ? <CandidateMatchingPage applications={applications} requisitions={requisitions} role={role} onSendToShortlist={sendToShortlisting}/> : location.pathname === "/shortlisting" ? <CandidateShortlistingPage applications={applications} requisitions={requisitions} role={role} onDecision={decideCandidate} onAdjustRank={adjustCandidateRank}/> : location.pathname === "/interviews" ? <HRInterviewsPage applications={applications} requisitions={requisitions} role={role} onContact={logContact} onSchedule={scheduleInterview} onInterviewStatus={updateInterviewStatus}/> : location.pathname === "/offers" ? <HiringOffersPage applications={applications} requisitions={requisitions} role={role} onUpdateOffer={updateOffer}/> : <Placeholder title={page.label}/>;
  return <div className="app-shell"><AppSidebar active={page.path} open={sidebarOpen} onClose={() => setSidebarOpen(false)} role={role} approvalCount={requisitions.filter((request) => request.status === "Pending HR Approval").length} applicationCount={applications.length}/><main className="main-area"><Topbar role={role} setRole={selectRole} onMenu={() => setSidebarOpen(true)} notify={notify}/><div className="main-content">{pageContent}<footer className="page-footer"><span>© {new Date().getFullYear()} Tandem People <i>·</i> Recruitment & Selection</span><span><span className="system-dot"/> All systems operational</span></footer></div></main>{modalOpen && <RequisitionModal role={role} requisition={editingRequest ?? undefined} onClose={() => { setModalOpen(false); setEditingRequest(null); }} onSave={saveRequisition}/ >}{toast && <div className="toast-message"><span><Check size={15}/></span>{toast}</div>}</div>;
}
