// Client helper: POST the assessment form (multipart/form-data) to the
// server route which then emails via Resend with real attachments.
// Framework-agnostic (uses fetch + FormData) — works on Vercel, Netlify,
// Cloudflare Pages, and any Node host.

export type AssessmentPayload = {
  stage: "started" | "completed";
  fullName: string;
  company?: string;
  email: string;
  phone: string;
  service: string;
  borderOfEntry?: string;
  countryOfOrigin?: string;
  destination?: string;
  cargoType?: string;
  borderClearanceType?: string;
  description?: string;
  files?: Record<string, File[]>; // key -> uploaded files
};

export type AssessmentResult = { ok: boolean; error?: string; id?: string };

export async function sendAssessment(payload: AssessmentPayload): Promise<AssessmentResult> {
  const fd = new FormData();
  fd.set("stage", payload.stage);
  fd.set("fullName", payload.fullName);
  if (payload.company) fd.set("company", payload.company);
  fd.set("email", payload.email);
  fd.set("phone", payload.phone);
  fd.set("service", payload.service);
  if (payload.borderOfEntry) fd.set("borderOfEntry", payload.borderOfEntry);
  if (payload.countryOfOrigin) fd.set("countryOfOrigin", payload.countryOfOrigin);
  if (payload.destination) fd.set("destination", payload.destination);
  if (payload.cargoType) fd.set("cargoType", payload.cargoType);
  if (payload.borderClearanceType) fd.set("borderClearanceType", payload.borderClearanceType);
  if (payload.description) fd.set("description", payload.description);

  if (payload.files) {
    for (const [key, list] of Object.entries(payload.files)) {
      list.forEach((f) => fd.append(key, f, f.name));
    }
  }

  try {
    const res = await fetch("/api/send-assessment", { method: "POST", body: fd });
    const json = (await res.json().catch(() => ({}))) as AssessmentResult;
    if (!res.ok || !json.ok) {
      return { ok: false, error: json.error || `Request failed (${res.status})` };
    }
    return { ok: true, id: json.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// Client-side file validation to catch issues before upload.
export const ALLOWED_EXT_RE = /\.(pdf|jpe?g|png|docx?|xlsx?)$/i;
export const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB per file
export const MAX_TOTAL_BYTES = 5 * 1024 * 1024; // 5 MB total (Vercel limit)

export function validateFiles(files: Record<string, File[]>): string | null {
  let totalSize = 0;
  
  for (const list of Object.values(files)) {
    for (const f of list) {
      if (!ALLOWED_EXT_RE.test(f.name)) return `Unsupported file type: ${f.name}. Allowed: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX.`;
      if (f.size > MAX_FILE_BYTES) return `"${f.name}" exceeds the 2 MB per-file limit (${(f.size / 1024 / 1024).toFixed(1)} MB).`;
      totalSize += f.size;
    }
  }
  
  if (totalSize > MAX_TOTAL_BYTES) {
    return `Total upload size (${(totalSize / 1024 / 1024).toFixed(1)} MB) exceeds the 5 MB limit. Please remove some files or upload smaller files.`;
  }
  
  return null;
}
