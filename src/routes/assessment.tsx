import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, type FormEvent, type ChangeEvent, type DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Upload, X, FileText, MessageCircle, Phone, Home, ArrowRight } from "lucide-react";
import { COMPANY, SERVICE_OPTIONS } from "@/lib/site-data";
import { CONTACT, buildWhatsAppLink } from "@/config/contact";
import { upsertHubspotLead } from "@/lib/hubspot.functions";
import { sendAssessment, validateFiles, MAX_FILE_BYTES, MAX_TOTAL_BYTES } from "@/lib/send-assessment";
import { useCreateLeadFromAssessment } from "@/lib/hooks/useLeads";
import { useCreateQuoteFromAssessment } from "@/lib/hooks/useQuotes";
import { supabase } from "@/lib/supabase";
import { generateTrackingToken } from "@/lib/hooks/useTracking";


export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: `Get Your Free Assessment — ${COMPANY.name}` },
      { name: "description", content: `Get a free logistics assessment from ${COMPANY.name}. Fast, transparent and tailored to your cargo.` },
      { property: "og:title", content: `Get Your Free Assessment — ${COMPANY.name}` },
      { property: "og:description", content: "Tell us about your cargo. We'll come back to you within hours." },
    ],
  }),
  component: AssessmentPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\d\s-]{6,20}$/;




type LeadData = {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  service: string;
};

type AssessmentData = {
  borderOfEntry: string;
  countryOfOrigin: string;
  destination: string;
  cargoType: string;
  borderClearanceType: string;
  description: string;
};

const DOC_FIELDS = [
  { key: "commercialInvoice", label: "Commercial Invoice" },
  { key: "airwayBill", label: "Airway Bill" },
  { key: "cargoManifest", label: "Cargo / Road Manifest" },
  { key: "billOfLading", label: "Bill of Lading" },
  { key: "certificateOfOrigin", label: "Certificate of Origin" },
  { key: "importPermit", label: "Import Permit (Controlled Goods)" },
  { key: "additional", label: "Additional Supporting Documents" },
] as const;

type DocKey = (typeof DOC_FIELDS)[number]["key"];

function inputCls(err?: string) {
  return `w-full rounded-lg border ${err ? "border-destructive" : "border-input"} bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/30`;
}

const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/80";

function AssessmentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | "processing" | 2 | "submitting" | "done">(1);
  const [lead, setLead] = useState<LeadData>({ fullName: "", company: "", email: "", phone: "", service: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contactId, setContactId] = useState<string | undefined>();
  const [leadId, setLeadId] = useState<string | undefined>();
  const [quoteId, setQuoteId] = useState<string | undefined>();
  const [trackingToken, setTrackingToken] = useState<string | undefined>();
  const [waLink, setWaLink] = useState<string>("");
  const [statusMsg, setStatusMsg] = useState("Saving your information and preparing your assessment…");
  const [checks, setChecks] = useState({ lead: false, email: false, whatsapp: false, crm: false, database: false, final: false });

  // Database mutations
  const createLeadMutation = useCreateLeadFromAssessment();
  const createQuoteMutation = useCreateQuoteFromAssessment();

  useEffect(() => {
    const el = document.getElementById("assessment-top");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const validateLead = () => {
    const e: Record<string, string> = {};
    if (!lead.fullName.trim()) e.fullName = "Required";
    if (!lead.email.trim() || !EMAIL_RE.test(lead.email)) e.email = "Enter a valid email";
    if (!lead.phone.trim() || !PHONE_RE.test(lead.phone)) e.phone = "Enter a valid phone number";
    if (!lead.service) e.service = "Please select a service";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLeadSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateLead()) return;
    setStep("processing");

    const now = new Date().toLocaleString();
    const waMessage = [
      `Hello ${COMPANY.name},`,
      "",
      "I have started a Get Quote assessment.",
      "",
      `Name: ${lead.fullName}`,
      `Company: ${lead.company || "-"}`,
      `Email: ${lead.email}`,
      `Phone: ${lead.phone}`,
      `Service Required: ${lead.service}`,
      "",
      "I will now continue with the assessment.",
    ].join("\n");
    const link = buildWhatsAppLink(waMessage);
    setWaLink(link);

    // 1) Save to database first (most important!)
    setStatusMsg("Saving your information to our database…");
    try {
      const dbLead = await createLeadMutation.mutateAsync({
        fullName: lead.fullName,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        service: lead.service,
      });
      setLeadId(dbLead.id);
      setChecks((c) => ({ ...c, database: true, lead: true }));
    } catch (error) {
      console.error("Failed to save lead to database:", error);
      setChecks((c) => ({ ...c, database: false, lead: true }));
    }

    // 2) Email via Resend server route (no attachments at lead stage)
    setStatusMsg("Sending your details to our team…");
    const emailRes = await sendAssessment({
      stage: "started",
      fullName: lead.fullName,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      service: lead.service,
    });
    setChecks((c) => ({ ...c, email: emailRes.ok }));

    // 3) WhatsApp — link only (browsers block auto-opening api.whatsapp.com)
    setChecks((c) => ({ ...c, whatsapp: true }));


    // 4) HubSpot
    setStatusMsg("Saving to our CRM…");
    try {
      const crm = await upsertHubspotLead({
        data: {
          fullName: lead.fullName,
          company: lead.company,
          email: lead.email,
          phone: lead.phone,
          service: lead.service,
          stage: "started",
          notes: `Website assessment started at ${now}. Service: ${lead.service}.`,
        },
      });
      if (crm.ok && "contactId" in crm && crm.contactId) setContactId(crm.contactId);
      setChecks((c) => ({ ...c, crm: !!crm.ok || !!(crm as { skipped?: boolean }).skipped }));
    } catch {
      /* continue */
    }

    setStatusMsg("Preparing your assessment…");
    await new Promise((r) => setTimeout(r, 600));
    setStep(2);
  };

  const [assessment, setAssessment] = useState<AssessmentData>({
    borderOfEntry: "",
    countryOfOrigin: "",
    destination: "",
    cargoType: "",
    borderClearanceType: "",
    description: "",
  });
  const [files, setFiles] = useState<Record<DocKey, File[]>>({
    commercialInvoice: [], airwayBill: [], cargoManifest: [], billOfLading: [],
    certificateOfOrigin: [], importPermit: [], additional: [],
  });
  const [assessErrors, setAssessErrors] = useState<Record<string, string>>({});

  const validateAssessment = () => {
    const e: Record<string, string> = {};
    if (!assessment.borderOfEntry.trim()) e.borderOfEntry = "Required";
    if (!assessment.countryOfOrigin.trim()) e.countryOfOrigin = "Required";
    if (!assessment.destination.trim()) e.destination = "Required";
    if (!assessment.cargoType.trim()) e.cargoType = "Required";
    if (!assessment.borderClearanceType) e.borderClearanceType = "Required";
    setAssessErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateAssessment()) return;

    // Client-side file validation before upload.
    const fileError = validateFiles(files);
    if (fileError) {
      setAssessErrors({ files: fileError });
      return;
    }

    setStep("submitting");

    const now = new Date().toLocaleString();
    const fileSummary = DOC_FIELDS
      .map((d) => {
        const arr = files[d.key];
        return arr.length ? `${d.label}: ${arr.map((f) => `${f.name} (${(f.size / 1024).toFixed(1)} KB)`).join(", ")}` : null;
      })
      .filter(Boolean)
      .join("\n") || "None uploaded";

    // 1) Save quote to database even when the lead step was interrupted.
    try {
      const quote = leadId
        ? await createQuoteMutation.mutateAsync({ leadId, service: lead.service, origin: assessment.countryOfOrigin, destination: assessment.destination, borderOfEntry: assessment.borderOfEntry, cargoType: assessment.cargoType, cargoDescription: assessment.description, borderClearanceType: assessment.borderClearanceType })
        : (await supabase.from("quotes").insert({ requester_name: lead.fullName, requester_email: lead.email, requester_phone: lead.phone, requester_company: lead.company || null, service_type: lead.service, origin: assessment.countryOfOrigin, destination: assessment.destination, cargo_description: `${assessment.cargoType}\n\nBorder of Entry: ${assessment.borderOfEntry}\nBorder Clearance Type: ${assessment.borderClearanceType}\n\n${assessment.description}`, status: "submitted", notes: `Website assessment completed at ${now}` } as any).select().single()).data;
      if (!quote) throw new Error("Quote was not returned by Supabase");
      setQuoteId(quote.id);
      setChecks((c) => ({ ...c, database: true }));
    } catch (error) {
      setAssessErrors({ database: error instanceof Error ? error.message : "Could not save your quote." });
      setStep(2);
      return;
    }

    const { data: shipment, error: shipmentError } = await supabase.from("shipments").insert({ quote_id: quoteId, origin: assessment.countryOfOrigin, destination: assessment.destination, cargo_description: assessment.description || assessment.cargoType, status: "awaiting_collection" } as any).select("id").single();
    if (shipmentError || !shipment) {
      setAssessErrors({ database: shipmentError?.message || "Could not create tracking record." });
      setStep(2);
      return;
    }
    const token = generateTrackingToken();
    const { error: tokenError } = await supabase.from("tracking_tokens").insert({ shipment_id: shipment.id, token, current_step: 1, status: "active" } as any);
    if (tokenError) {
      setAssessErrors({ database: tokenError.message });
      setStep(2);
      return;
    }
    setTrackingToken(token);

    // 2) Email via Resend — with real attachments
    const emailRes = await sendAssessment({
      stage: "completed",
      fullName: lead.fullName,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      service: lead.service,
      borderOfEntry: assessment.borderOfEntry,
      countryOfOrigin: assessment.countryOfOrigin,
      destination: assessment.destination,
      cargoType: assessment.cargoType,
      borderClearanceType: assessment.borderClearanceType,
      description: assessment.description,
      files,
    });
    if (!emailRes.ok) {
      setAssessErrors({ files: emailRes.error || "Could not send your assessment email. Please try again." });
      setStep(2);
      return;
    }

    // 3) WhatsApp — build a link the user can click on the Thank You page.
    const waMsg = [
      `Hello ${COMPANY.name},`,
      "",
      "I have completed my Get Quote assessment. Full details below:",
      "",
      `Name: ${lead.fullName}`,
      `Company: ${lead.company || "-"}`,
      `Email: ${lead.email}`,
      `Phone: ${lead.phone}`,
      `Service Required: ${lead.service}`,
      "",
      `Border of Entry: ${assessment.borderOfEntry}`,
      `Country of Origin: ${assessment.countryOfOrigin}`,
      `Destination: ${assessment.destination}`,
      `Cargo Type: ${assessment.cargoType}`,
      `Border Clearance Type: ${assessment.borderClearanceType}`,
      `Description: ${assessment.description || "-"}`,
      "",
      `Documents:\n${fileSummary}`,
    ].join("\n");
    setWaLink(buildWhatsAppLink(waMsg));


    // 4) HubSpot update
    try {
      await upsertHubspotLead({
        data: {
          fullName: lead.fullName,
          company: lead.company,
          email: lead.email,
          phone: lead.phone,
          service: lead.service,
          stage: "completed",
          contactId,
          notes: [
            `Assessment completed at ${now}.`,
            `Border of Entry: ${assessment.borderOfEntry}`,
            `Country of Origin: ${assessment.countryOfOrigin}`,
            `Destination: ${assessment.destination}`,
            `Cargo Type: ${assessment.cargoType}`,
            `Border Clearance Type: ${assessment.borderClearanceType}`,
            `Description: ${assessment.description}`,
            `Documents: ${fileSummary}`,
          ].join("\n"),
        },
      });
    } catch { /* ignore */ }

    setChecks((c) => ({ ...c, final: true }));
    setStep("done");
  };

  return (
    <section className="bg-gradient-to-b from-[var(--navy)] to-[var(--navy-deep)] pt-28 pb-16 md:pt-32 text-white min-h-screen">
      <div id="assessment-top" className="container-x">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs sm:text-[11px] font-semibold uppercase tracking-[0.18em]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" /> Free Assessment
        </span>
        <h1 className="mt-4 max-w-4xl font-display text-3xl font-bold md:text-5xl">
          Get your <span className="text-gradient-gold">free logistics assessment.</span>
        </h1>
        <p className="mt-3 max-w-3xl text-white/80">
          {step === 1 && "Start with a few contact details — takes less than a minute."}
          {step === 2 && "Great — now tell us about your cargo."}
          {step === "done" && "We've received your request."}
        </p>

        {/* Progress */}
        {(step === 1 || step === 2 || step === "processing" || step === "submitting") && (
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wider">
            <StepPill n={1} label="Lead Capture" active={step === 1 || step === "processing"} done={step === 2 || step === "submitting"} />
            <div className="order-last flex h-px w-full bg-white/20 sm:order-none sm:flex-1" />
            <StepPill n={2} label="Assessment" active={step === 2 || step === "submitting"} done={false} />
          </div>
        )}
      </div>

      <div className="container-x mt-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="step1"
              onSubmit={handleLeadSubmit}
              noValidate
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mx-auto w-full max-w-3xl rounded-3xl bg-background p-4 sm:p-6 md:p-10 text-foreground shadow-2xl"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelCls}>Full Name *</label>
                  <input className={inputCls(errors.fullName)} value={lead.fullName} onChange={(e) => setLead({ ...lead, fullName: e.target.value })} autoComplete="name" />
                  {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
                </div>
                <div>
                  <label className={labelCls}>Company Name</label>
                  <input className={inputCls()} value={lead.company} onChange={(e) => setLead({ ...lead, company: e.target.value })} autoComplete="organization" />
                </div>
                <div>
                  <label className={labelCls}>Email Address *</label>
                  <input type="email" className={inputCls(errors.email)} value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} autoComplete="email" />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                </div>
                <div>
                  <label className={labelCls}>Phone Number *</label>
                  <input type="tel" className={inputCls(errors.phone)} value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} autoComplete="tel" />
                  {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>Service Required *</label>
                  <select className={inputCls(errors.service)} value={lead.service} onChange={(e) => setLead({ ...lead, service: e.target.value })}>
                    <option value="" disabled>Select a service…</option>
                    {SERVICE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  {errors.service && <p className="mt-1 text-xs text-destructive">{errors.service}</p>}
                </div>
              </div>
              <button type="submit" className="mt-6 inline-flex w-full justify-center items-center gap-2 rounded-full bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-elegant)] transition hover:bg-[var(--navy-deep)] sm:w-auto sm:px-7 sm:py-3.5">
                Continue Assessment <ArrowRight className="h-4 w-4" />
              </button>
            </motion.form>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mx-auto max-w-xl rounded-3xl bg-background p-10 text-center text-foreground shadow-2xl"
            >
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-[var(--gold)]" />
              <h3 className="mt-5 font-display text-xl font-bold">{statusMsg}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Just a moment while we save your details.</p>
              <div className="mx-auto mt-6 max-w-xs space-y-2 text-left text-sm">
                <ProcessRow label="Lead captured" done={checks.lead} />
                <ProcessRow label="Saved to database" done={checks.database} />
                <ProcessRow label="Email sent" done={checks.email} />
                <ProcessRow label="WhatsApp opened" done={checks.whatsapp} />
                <ProcessRow label="CRM updated" done={checks.crm} />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.form
              key="step2"
              onSubmit={handleFinalSubmit}
              noValidate
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="mx-auto w-full max-w-4xl rounded-3xl bg-background p-4 sm:p-6 md:p-10 text-foreground shadow-2xl"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="Border of Entry" required value={assessment.borderOfEntry} err={assessErrors.borderOfEntry} onChange={(v) => setAssessment({ ...assessment, borderOfEntry: v })} />
                <TextField label="Country of Origin" required value={assessment.countryOfOrigin} err={assessErrors.countryOfOrigin} onChange={(v) => setAssessment({ ...assessment, countryOfOrigin: v })} />
                <TextField label="Destination" required value={assessment.destination} err={assessErrors.destination} onChange={(v) => setAssessment({ ...assessment, destination: v })} />
                <TextField label="Cargo Type" required value={assessment.cargoType} err={assessErrors.cargoType} onChange={(v) => setAssessment({ ...assessment, cargoType: v })} />
                <div className="md:col-span-2">
                  <label className={labelCls}>Border Clearance Type *</label>
                  <select className={inputCls(assessErrors.borderClearanceType)} value={assessment.borderClearanceType} onChange={(e) => setAssessment({ ...assessment, borderClearanceType: e.target.value })}>
                    <option value="" disabled>Select clearance type…</option>
                    {["Import", "Export", "Transit / Cross-border", "Temporary Import", "Re-export"].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  {assessErrors.borderClearanceType && <p className="mt-1 text-xs text-destructive">{assessErrors.borderClearanceType}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>Cargo Description</label>
                  <textarea rows={4} className={inputCls()} value={assessment.description} onChange={(e) => setAssessment({ ...assessment, description: e.target.value })} placeholder="Describe your cargo (contents, packaging, special handling)…" />
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-display text-lg font-bold">Documents</h3>
                <p className="mt-1 text-sm text-muted-foreground">Drag & drop or click to upload. Files are referenced in your email and WhatsApp message.</p>
                <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                  <p className="font-semibold">File Size Limits:</p>
                  <ul className="mt-1 ml-2 space-y-1 list-disc">
                    <li>Maximum 2 MB per file</li>
                    <li>Total upload limit: 5 MB</li>
                    <li>Supported formats: PDF, images, documents</li>
                  </ul>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {DOC_FIELDS.map((d) => (
                    <DropZone
                      key={d.key}
                      label={d.label}
                      files={files[d.key]}
                      onFiles={(f) => setFiles((prev) => ({ ...prev, [d.key]: f }))}
                    />
                  ))}
                </div>
              </div>

              {assessErrors.files && <p className="mt-4 text-sm text-destructive">{assessErrors.files}</p>}

              <button type="submit" className="mt-6 inline-flex w-full justify-center items-center gap-2 rounded-full bg-[var(--gold)] px-4 py-2.5 text-sm font-semibold text-[var(--navy-deep)] shadow-[var(--shadow-gold)] transition hover:brightness-110 sm:w-auto sm:px-7 sm:py-3.5">
                Submit Assessment <ArrowRight className="h-4 w-4" />
              </button>

            </motion.form>
          )}

          {step === "submitting" && (
            <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-xl rounded-3xl bg-background p-10 text-center text-foreground shadow-2xl">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-[var(--gold)]" />
              <h3 className="mt-5 font-display text-xl font-bold">Submitting your assessment…</h3>
              <p className="mt-2 text-sm text-muted-foreground">Sending email, updating WhatsApp, and syncing your CRM record.</p>
            </motion.div>
          )}

          {step === "done" && (
            <DoneStep waLink={waLink} crmDone={checks.crm} trackingToken={trackingToken} quoteId={quoteId} navigate={navigate} />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function DoneStep({ waLink, crmDone, trackingToken, quoteId, navigate }: { waLink: string; crmDone: boolean; trackingToken?: string; quoteId?: string; navigate: ReturnType<typeof useNavigate> }) {
  useEffect(() => {
    const t = setTimeout(() => {
      navigate({ to: "/appoint-nitram" });
    }, 4500);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <motion.div key="done" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-2xl rounded-3xl bg-background p-8 text-center text-foreground shadow-2xl md:p-12">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--gold)]/15">
        <CheckCircle2 className="h-10 w-10 text-[var(--gold)]" />
      </div>
      <h2 className="mt-6 font-display text-3xl font-bold md:text-4xl">Thank You for Your Quote Request!</h2>
      <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
        Your assessment has been submitted successfully. One final step remains — appoint Nitram on the ZRA Portal so we can begin your customs clearance.
      </p>

      {(trackingToken || quoteId) && (
        <div className="mx-auto mt-6 max-w-sm rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your tracking reference</p>
          {trackingToken && <p className="mt-1 font-mono text-2xl font-bold tracking-[0.2em]">{trackingToken}</p>}
          {quoteId && <p className="mt-1 text-xs text-muted-foreground">Quote ID: {quoteId}</p>}
          {trackingToken && <Link to="/track" search={{ token: trackingToken }} className="mt-3 inline-flex text-sm font-semibold text-[var(--navy)] underline">Track shipment</Link>}
        </div>
      )}

      <div className="mx-auto mt-8 max-w-sm space-y-2 text-left">
        <ProcessRow label="Initial Lead Captured" done />
        <ProcessRow label="Saved to Database" done />
        <ProcessRow label="Assessment Submitted" done />
        <ProcessRow label="Email Sent" done />
        <ProcessRow label="WhatsApp Notification Sent" done />
        <ProcessRow label="CRM Updated" done={crmDone} />
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/appoint-nitram" className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[var(--navy-deep)] shadow-[var(--shadow-gold)] transition hover:brightness-110">
          Continue — Appoint Nitram on ZRA <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <a href={CONTACT.phoneHref} className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-[var(--navy-deep)]">
          <Phone className="h-4 w-4" /> Call Us
        </a>
        <a href={waLink || buildWhatsAppLink(`Hello ${COMPANY.name}, I just submitted an assessment.`)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow transition hover:brightness-105">
          <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
        </a>
        <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground/80 hover:bg-muted">
          <Home className="h-4 w-4" /> Return to Home
        </Link>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">Redirecting you to the ZRA appointment guide…</p>
    </motion.div>
  );
}


function StepPill({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${active ? "bg-[var(--gold)] text-[var(--navy-deep)]" : done ? "bg-white/20 text-white" : "bg-white/5 text-white/60"}`}>
    <span className="grid h-5 w-5 place-items-center rounded-full bg-black/10 text-xs sm:text-[10px]">{done ? "✓" : n}</span>
      {label}
    </div>
  );
}

function ProcessRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {done ? <CheckCircle2 className="h-4 w-4 text-[var(--brand-green)]" /> : <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

function TextField({ label, required, value, err, onChange }: { label: string; required?: boolean; value: string; err?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className={labelCls}>{label}{required && " *"}</label>
      <input className={inputCls(err)} value={value} onChange={(e) => onChange(e.target.value)} />
      {err && <p className="mt-1 text-xs text-destructive">{err}</p>}
    </div>
  );
}

function DropZone({ label, files, onFiles }: { label: string; files: File[]; onFiles: (f: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string>("");

  // Calculate current total size
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const remainingSize = MAX_TOTAL_BYTES - totalSize;
  const isNearLimit = remainingSize < 1 * 1024 * 1024; // Less than 1 MB remaining

  const validateAndAdd = (newFiles: File[]) => {
    setError("");
    
    // Check individual file sizes
    for (const f of newFiles) {
      if (f.size > MAX_FILE_BYTES) {
        setError(`"${f.name}" exceeds 2 MB limit (${(f.size / 1024 / 1024).toFixed(1)} MB). Please upload a smaller file.`);
        return;
      }
      if (!/\.(pdf|jpe?g|png|docx?|xlsx?)$/i.test(f.name)) {
        setError(`"${f.name}" is not supported. Allowed: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX.`);
        return;
      }
    }
    
    // Check if total size would exceed limit
    const newTotalSize = totalSize + newFiles.reduce((sum, f) => sum + f.size, 0);
    if (newTotalSize > MAX_TOTAL_BYTES) {
      const exceedsBy = newTotalSize - MAX_TOTAL_BYTES;
      setError(`Adding these files would exceed the 5 MB total limit by ${(exceedsBy / 1024 / 1024).toFixed(1)} MB. Remove some files or upload smaller files.`);
      return;
    }
    
    onFiles([...files, ...newFiles]);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDrag(false);
    const list = Array.from(e.dataTransfer.files);
    validateAndAdd(list);
  };
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    validateAndAdd(list);
  };
  const remove = (idx: number) => onFiles(files.filter((_, i) => i !== idx));
  
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-5 text-center transition ${drag ? "border-[var(--gold)] bg-[var(--gold)]/5" : "border-input bg-muted/30 hover:border-[var(--gold)]/60"}`}
      >
        <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-xs text-muted-foreground">Drop files here or <span className="font-semibold text-[var(--navy)]">browse</span></p>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={onChange} />
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className={`rounded-md px-3 py-2 text-xs ${isNearLimit ? "bg-orange-50 text-orange-900" : "bg-muted/50 text-muted-foreground"}`}>
            <span className="font-semibold">Storage:</span> {(totalSize / 1024 / 1024).toFixed(1)} MB of 5 MB used
            {isNearLimit && <span className="block mt-1 font-semibold">⚠️ Only {(remainingSize / 1024 / 1024).toFixed(1)} MB remaining</span>}
          </div>
          <ul className="space-y-1">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-xs">
                <span className="flex items-center gap-2 truncate"><FileText className="h-3.5 w-3.5 text-[var(--navy)]" /> <span className="truncate">{f.name}</span> <span className="text-muted-foreground">({(f.size / 1024 / 1024).toFixed(2)} MB)</span></span>
                <button type="button" onClick={(e) => { e.stopPropagation(); remove(i); }} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
