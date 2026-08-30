import { createFileRoute } from "@tanstack/react-router";

// Production-ready assessment email endpoint using Resend.
// Accepts multipart/form-data with text fields + uploaded files.
// Files are forwarded to Resend as real attachments (base64), so the
// recipient can download the original documents from Gmail.
//
// Deployable anywhere the app runs (Vercel / Netlify / Cloudflare / Node)
// because it uses standard Web Request APIs — no Lovable-only code.

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);
const ALLOWED_EXT = /\.(pdf|jpe?g|png|docx?|xlsx?)$/i;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB per file
const MAX_TOTAL_BYTES = 40 * 1024 * 1024; // ~Resend hard cap, safely under Vercel's 50 MB limit
const MAX_FIELD_LEN = 5000;

const DOC_KEYS = [
  ["commercialInvoice", "Commercial Invoice"],
  ["airwayBill", "Airway Bill"],
  ["billOfLading", "Bill of Lading"],
  ["cargoManifest", "Cargo / Road Manifest"],
  ["certificateOfOrigin", "Certificate of Origin"],
  ["importPermit", "Import Permit"],
  ["additional", "Additional Supporting Documents"],
] as const;

const TEXT_FIELDS = [
  ["fullName", "Full Name"],
  ["company", "Company Name"],
  ["email", "Email"],
  ["phone", "Phone Number"],
  ["service", "Service Required"],
  ["borderOfEntry", "Border of Entry"],
  ["countryOfOrigin", "Country of Origin"],
  ["destination", "Destination"],
  ["cargoType", "Cargo Type"],
  ["borderClearanceType", "Border Clearance Type"],
  ["description", "Cargo Description"],
  ["stage", "Stage"],
] as const;

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  // btoa exists in Workers, Node 18+, and browsers.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const b64: (s: string) => string = (globalThis as any).btoa ?? ((s: string) => Buffer.from(s, "binary").toString("base64"));
  return b64(binary);
}

export const Route = createFileRoute("/api/send-assessment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const ASSESSMENT_EMAIL = process.env.ASSESSMENT_EMAIL || "info@nitramclearing.co.zm";
        // Use verified domain from Resend. If not set, falls back to test domain for development.
        const SAFE_FROM = "Nitram Assessments <onboarding@resend.dev>";
        const FROM_EMAIL = process.env.ASSESSMENT_FROM_EMAIL || "Nitram Assessments <noreply@nitramclearing.co.zm>";

        // BYPASS MODE: Email sending disabled - data will be logged only
        const BYPASS_EMAIL = !RESEND_API_KEY || process.env.BYPASS_EMAIL === "true";
        
        if (BYPASS_EMAIL) {
          console.log("[BYPASS MODE] Email sending is disabled. Assessment data will be logged instead.");
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ ok: false, error: "Invalid form data" }, { status: 400 });
        }

        // ---- Text fields ----
        const fields: Record<string, string> = {};
        for (const [key] of TEXT_FIELDS) {
          const raw = form.get(key);
          if (typeof raw === "string") {
            const v = raw.trim().slice(0, MAX_FIELD_LEN);
            if (v) fields[key] = v;
          }
        }

        // Basic validation
        if (!fields.fullName || !fields.email || !fields.phone) {
          return Response.json({ ok: false, error: "Missing required fields." }, { status: 400 });
        }

        // ---- Attachments ----
        type Attachment = { filename: string; content: string; contentType?: string };
        const attachments: Attachment[] = [];
        const attachmentSummary: string[] = [];
        let totalBytes = 0;

        for (const [key, label] of DOC_KEYS) {
          const entries = form.getAll(key).filter((v): v is File => v instanceof File && v.size > 0);
          if (!entries.length) continue;
          const names: string[] = [];
          for (const file of entries) {
            const mime = file.type || "";
            const okType = ALLOWED_MIME.has(mime) || ALLOWED_EXT.test(file.name);
            if (!okType) {
              return Response.json({ ok: false, error: `Unsupported file type: ${file.name}` }, { status: 400 });
            }
            if (file.size > MAX_FILE_BYTES) {
              return Response.json({ ok: false, error: `${file.name} exceeds the 10 MB per-file limit.` }, { status: 400 });
            }
            totalBytes += file.size;
            if (totalBytes > MAX_TOTAL_BYTES) {
              return Response.json({ ok: false, error: "Total attachment size exceeds 35 MB." }, { status: 400 });
            }
            const buf = await file.arrayBuffer();
            attachments.push({
              filename: file.name,
              content: arrayBufferToBase64(buf),
              contentType: mime || undefined,
            });
            names.push(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
          }
          attachmentSummary.push(`${label}: ${names.join(", ")}`);
        }

        // ---- Build email HTML ----
        const stage = fields.stage === "completed" ? "Assessment Completed" : fields.stage === "started" ? "Assessment Started" : "Assessment";
        const subject = "Cargo Assessment Received";
        const firstName = fields.fullName.split(/\s+/)[0] || fields.fullName;
        const userMessage = fields.stage === "completed"
          ? `Dear ${esc(firstName)},

Thank you for submitting your cargo details.

Our operations team is now reviewing your shipment.

The next step is to appoint Nitram Logistics as your Customs Clearing Agent.

Please complete the ZRA Agent Appointment Form on the next page.

Need assistance?

☎ +260 776833956

Kind regards,

Nitram Logistics`
          : `Hello ${esc(firstName)},

Thank you for contacting Nitram Logistics Limited.

We’ve successfully received the first part of your quotation request.

Our team is reviewing your information.

To help us prepare an accurate quotation, please complete the Cargo Assessment on the next page.

Once completed, one of our customs specialists will contact you.

Need assistance?

☎ +260 776 833 956

Kind regards,

Nitram Logistics`;

        const rows = TEXT_FIELDS
          .filter(([k]) => k !== "stage" && fields[k])
          .map(([k, label]) => `<tr><td style="padding:6px 12px;background:#f6f7f9;font-weight:600;color:#0f172a;border:1px solid #e5e7eb;">${esc(label)}</td><td style="padding:6px 12px;border:1px solid #e5e7eb;color:#0f172a;">${esc(fields[k])}</td></tr>`)
          .join("");

        const attachmentsBlock = attachmentSummary.length
          ? `<h3 style="margin:24px 0 8px;color:#0f172a;font-family:Arial,sans-serif;">Attachments</h3><ul style="margin:0;padding-left:18px;color:#0f172a;font-family:Arial,sans-serif;font-size:14px;">${attachmentSummary.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`
          : `<p style="color:#64748b;font-family:Arial,sans-serif;font-size:13px;margin-top:16px;">No documents were uploaded.</p>`;

        const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,sans-serif;">
          <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <div style="padding:20px 24px;background:#0b1f3a;color:#fff;">
              <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#d4af37;">${esc(stage)}</div>
              <h2 style="margin:6px 0 0;font-size:20px;">${esc(subject)}</h2>
            </div>
            <div style="padding:20px 24px;">
              <div style="white-space:pre-line;color:#0f172a;font-size:15px;line-height:1.7;">${userMessage}</div>
              <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:14px;margin-top:20px;">${rows}</table>
              ${attachmentsBlock}
              <p style="margin-top:24px;color:#64748b;font-size:12px;">Sent automatically from the Nitram Logistics website.</p>
            </div>
          </div>
        </body></html>`;

        const text =
          userMessage +
          "\n\n--- Submission details ---\n" +
          TEXT_FIELDS.filter(([k]) => k !== "stage" && fields[k]).map(([k, label]) => `${label}: ${fields[k]}`).join("\n") +
          (attachmentSummary.length ? `\n\nAttachments:\n- ${attachmentSummary.join("\n- ")}` : "");

        // BYPASS MODE: If email is disabled, just log and return success
        if (BYPASS_EMAIL) {
          console.log("========================================");
          console.log("📧 ASSESSMENT FORM SUBMISSION (EMAIL BYPASSED)");
          console.log("========================================");
          console.log("Subject:", subject);
          console.log("To:", ASSESSMENT_EMAIL);
          console.log("Reply-to:", fields.email);
          console.log("\nForm Data:");
          TEXT_FIELDS.filter(([k]) => k !== "stage" && fields[k]).forEach(([k, label]) => {
            console.log(`  ${label}: ${fields[k]}`);
          });
          if (attachmentSummary.length) {
            console.log("\nAttachments:");
            attachmentSummary.forEach(s => console.log(`  - ${s}`));
          }
          console.log("========================================");
          
          return Response.json({ 
            ok: true, 
            id: `bypass-${Date.now()}`,
            message: "Assessment received (email bypassed - check server logs)" 
          });
        }

        const sendViaResend = async (from: string) => {
          // Validate email addresses - more strict validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!ASSESSMENT_EMAIL || !emailRegex.test(ASSESSMENT_EMAIL)) {
            throw new Error(`Invalid recipient email address: ${ASSESSMENT_EMAIL}`);
          }
          if (!fields.email || !emailRegex.test(fields.email)) {
            throw new Error(`Invalid reply-to email address: ${fields.email}`);
          }

          // Only include attachments if we have them; ensure they have valid base64 content
          const payload = {
            from,
            to: [fields.email],
            ...(ASSESSMENT_EMAIL && ASSESSMENT_EMAIL.toLowerCase() !== fields.email.toLowerCase() && { cc: [ASSESSMENT_EMAIL] }),
            reply_to: ASSESSMENT_EMAIL,
            subject,
            html,
            text,
            ...(attachments.length > 0 && {
              attachments: attachments.map((a) => ({
                filename: a.filename,
                content: a.content,
                ...(a.contentType && { contentType: a.contentType }),
              })),
            }),
          };

          console.log("[v0] Sending email via Resend:", { 
            to: ASSESSMENT_EMAIL, 
            from, 
            hasAttachments: attachments.length > 0,
            textLength: text.length
          });

          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          return response;
        };

        let resendRes;
        try {
          resendRes = await sendViaResend(FROM_EMAIL);
        } catch (err) {
          return Response.json(
            { ok: false, error: `Email validation failed: ${err instanceof Error ? err.message : "Unknown error"}` },
            { status: 400 }
          );
        }

        // Auto-fallback: if the configured domain isn't verified in Resend,
        // retry once with Resend's shared onboarding sender so the lead still lands.
        if (!resendRes.ok && FROM_EMAIL !== SAFE_FROM) {
          const detail = await resendRes.clone().text().catch(() => "");
          if (/not verified|domain/i.test(detail)) {
            resendRes = await sendViaResend(SAFE_FROM);
          }
        }

        if (!resendRes.ok) {
          let detail = "";
          try {
            const json = await resendRes.json();
            detail = JSON.stringify(json, null, 2);
          } catch {
            detail = await resendRes.text().catch(() => "");
          }
          
          const errorMsg = `Email send failed (${resendRes.status})`;
          console.error("[v0] Resend API error:", { 
            status: resendRes.status, 
            detail, 
            recipientEmail: ASSESSMENT_EMAIL,
            senderEmail: FROM_EMAIL,
            replyToEmail: fields.email,
            payloadKeys: Object.keys({
              from: FROM_EMAIL,
              to: [fields.email],
              cc: ASSESSMENT_EMAIL && ASSESSMENT_EMAIL.toLowerCase() !== fields.email.toLowerCase() ? [ASSESSMENT_EMAIL] : undefined,
              reply_to: ASSESSMENT_EMAIL,
              subject,
              html: `HTML (${html.length} chars)`,
              text: `Text (${text.length} chars)`,
              attachments: `${attachments.length} files`,
            })
          });
          
          return Response.json(
            {
              ok: false,
              error: errorMsg,
              ...(resendRes.status === 422 && { 
                suggestion: "Invalid email address format or request validation failed. Check that all email addresses are valid." 
              }),
              ...(resendRes.status === 401 && { 
                suggestion: "API key is invalid or missing. Check RESEND_API_KEY environment variable." 
              }),
            },
            { status: 502 }
          );
        }

        const json = (await resendRes.json().catch(() => ({}))) as { id?: string };
        return Response.json({ ok: true, id: json.id });
      },
    },
  },
});
