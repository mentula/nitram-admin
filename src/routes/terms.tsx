import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Nitram Logistics Limited" },
      { name: "description", content: "Terms governing the use of Nitram Logistics Limited services and website." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms & Conditions" description="The terms that govern our services and this website." />
      <section className="py-20">
        <div className="container-x max-w-3xl space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>By engaging Nitram Logistics Limited, you agree to the following terms. Services are provided subject to applicable Zambian laws and customs regulations.</p>
          <h2 className="font-display text-xl font-bold text-foreground">Service scope</h2>
          <p>Specific service deliverables, timelines and pricing are confirmed per consignment in writing.</p>
          <h2 className="font-display text-xl font-bold text-foreground">Liability</h2>
          <p>Our liability is governed by the Standard Trading Conditions of the Zambia Freight Forwarders Association where applicable, unless otherwise agreed in writing.</p>
          <h2 className="font-display text-xl font-bold text-foreground">Payment</h2>
          <p>Invoices are payable within agreed terms. Disbursements made on the client's behalf are recoverable in full.</p>
          <h2 className="font-display text-xl font-bold text-foreground">Website use</h2>
          <p>This website is provided for general information. Content may change without notice. All trademarks and logos are property of their respective owners.</p>
        </div>
      </section>
    </>
  );
}
