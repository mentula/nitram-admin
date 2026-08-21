import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LeadSchema = z.object({
  fullName: z.string().min(1),
  company: z.string().optional().default(""),
  email: z.string().email(),
  phone: z.string().min(4),
  service: z.string().min(1),
  stage: z.enum(["started", "completed"]).default("started"),
  contactId: z.string().optional(),
  notes: z.string().optional().default(""),
});

const GATEWAY_URL = "https://connector-gateway.lovable.dev/hubspot";

export const upsertHubspotLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => LeadSchema.parse(data))
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
    if (!LOVABLE_API_KEY || !HUBSPOT_API_KEY) {
      return { ok: false, skipped: true, reason: "HubSpot not configured" };
    }

    const headers = {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": HUBSPOT_API_KEY,
      "Content-Type": "application/json",
    } as const;

    const [firstName, ...rest] = data.fullName.trim().split(/\s+/);
    const lastName = rest.join(" ") || "-";
    const status = data.stage === "completed" ? "Assessment Completed" : "Assessment Started";

    try {
      // Upsert contact by email
      let contactId = data.contactId;
      if (!contactId) {
        const searchRes = await fetch(`${GATEWAY_URL}/crm/v3/objects/contacts/search`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: data.email }] }],
            properties: ["email"],
            limit: 1,
          }),
        });
        const searchJson = (await searchRes.json()) as { results?: Array<{ id: string }> };
        contactId = searchJson.results?.[0]?.id;
      }

      const contactProps = {
        email: data.email,
        firstname: firstName,
        lastname: lastName,
        phone: data.phone,
        company: data.company,
        hs_lead_status: "NEW",
        lifecyclestage: "lead",
        nitram_service_required: data.service,
        nitram_lead_status: status,
      };

      if (contactId) {
        await fetch(`${GATEWAY_URL}/crm/v3/objects/contacts/${contactId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ properties: contactProps }),
        });
      } else {
        const createRes = await fetch(`${GATEWAY_URL}/crm/v3/objects/contacts`, {
          method: "POST",
          headers,
          body: JSON.stringify({ properties: contactProps }),
        });
        const created = (await createRes.json()) as { id?: string };
        contactId = created.id;
      }

      // Add a note with details
      if (contactId && data.notes) {
        await fetch(`${GATEWAY_URL}/crm/v3/objects/notes`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            properties: {
              hs_note_body: data.notes,
              hs_timestamp: Date.now(),
            },
            associations: [
              {
                to: { id: contactId },
                types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }],
              },
            ],
          }),
        });
      }

      return { ok: true, contactId, status };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  });
