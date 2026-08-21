import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, MessageCircle, Loader2 } from "lucide-react";
import { COMPANY, SERVICE_OPTIONS } from "@/lib/site-data";
import { sendAssessment, validateFiles, MAX_FILE_BYTES, MAX_TOTAL_BYTES } from "@/lib/send-assessment";
import { buildWhatsAppLink } from "@/config/contact";

const schema = z.object({
  fullName: z.string().trim().min(2, "Required").max(100),
  email: z.string().trim().email("Invalid email").max(160),
  phone: z.string().trim().min(6, "Required").max(40),
  service: z.string().min(1, "Select a service"),
});

export function QuoteForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [waLink, setWaLink] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.currentTarget.files ? Array.from(e.currentTarget.files) : [];
    const validationError = validateFiles({ additional: list });
    setFileError(validationError);
    setFiles(list);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries()) as Record<string, string>;
    const result = schema.safeParse(data);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSendError(null);
    setSubmitting(true);

    if (files.length > 0) {
      const fileValidation = validateFiles({ additional: files });
      if (fileValidation) {
        setFileError(fileValidation);
        setSubmitting(false);
        return;
      }
    }

    const messageBody =
`Hello ${COMPANY.name},
I would like to get my free assessment regarding your logistics services.

Name: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone}
Service Required: ${data.service}`;

    setWaLink(buildWhatsAppLink(messageBody));

    const res = await sendAssessment({
      stage: "started",
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      service: data.service,
      ...(files.length > 0 ? { files: { additional: files } } : {}),
    });

    setSubmitting(false);
    if (!res.ok) {
      setSendError(res.error || "Could not send your request. Please try again.");
      return;
    }
    setSent(true);
  };


  if (sent) {
    return (
      <div className="rounded-2xl border border-[var(--gold)]/40 bg-card p-8 text-center shadow-[var(--shadow-elegant)]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--gold)]/15">
          <CheckCircle2 className="h-8 w-8 text-[var(--gold)]" />
        </div>
        <h3 className="mt-5 font-display text-2xl font-bold">Thank you!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your free assessment request has been received. A {COMPANY.name} representative will contact you shortly.
        </p>
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow transition hover:brightness-105"
        >
          <MessageCircle className="h-4 w-4" /> Continue on WhatsApp
        </a>
      </div>
    );
  }

  const field = "w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/30";
  const label = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/80";

  return (
    <form id="assessment-form" onSubmit={onSubmit} noValidate className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6 md:p-8 shadow-[var(--shadow-elegant)] scroll-mt-24">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={label}>Full Name *</label>
          <input name="fullName" autoComplete="name" className={field} />
          {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
        </div>
        <div>
          <label className={label}>Email Address *</label>
          <input name="email" type="email" autoComplete="email" className={field} />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>
        <div>
          <label className={label}>Phone Number *</label>
          <input name="phone" type="tel" autoComplete="tel" className={field} />
          {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
        </div>
        <div className="md:col-span-2">
          <label className={label}>Service Required *</label>
          <select name="service" defaultValue="" className={field}>
            <option value="" disabled>Select a service…</option>
            {SERVICE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.service && <p className="mt-1 text-xs text-destructive">{errors.service}</p>}
        </div>
        <div className="md:col-span-2">
          <label className={label}>Supporting Documents</label>
          <input
            name="additional"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            multiple
            onChange={handleFilesChange}
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/30"
          />
          <p className="mt-1 text-xs text-muted-foreground">Upload any supporting documents for your request.</p>
          {fileError && <p className="mt-1 text-xs text-destructive">{fileError}</p>}
          {files.length > 0 && (
            <div className="mt-3 space-y-2 text-sm text-foreground">
              {files.map((file) => (
                <div key={file.name} className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {sendError && <p className="text-xs text-destructive">{sendError}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-elegant)] transition hover:bg-[var(--navy-deep)] disabled:opacity-70 sm:w-auto sm:px-7 sm:py-3"
      >
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : "Submit"}
      </button>

    </form>
  );
}
