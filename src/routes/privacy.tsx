import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Nitram Logistics Limited" },
      { name: "description", content: "How Nitram Logistics Limited collects, uses and protects your information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" description="How we collect, use and protect your information." />
      <section className="py-20">
        <div className="container-x max-w-3xl space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>This Privacy Policy explains how Nitram Logistics Limited ("Nitram", "we") collects and processes personal information you provide when using our website or engaging our services.</p>
          <h2 className="font-display text-xl font-bold text-foreground">Information we collect</h2>
          <p>We collect information you submit through forms (such as quote requests), correspondence and operational documents required for customs clearance and freight forwarding.</p>
          <h2 className="font-display text-xl font-bold text-foreground">How we use information</h2>
          <p>We use your information solely to provide our logistics services, respond to enquiries and meet regulatory obligations. We do not sell personal information to third parties.</p>
          <h2 className="font-display text-xl font-bold text-foreground">Data sharing</h2>
          <p>We share information only with authorities, carriers and partners necessary to perform the contracted service.</p>
          <h2 className="font-display text-xl font-bold text-foreground">Contact</h2>
          <p>For any privacy enquiries, contact us at info@nitramclearing.co.zm.</p>
        </div>
      </section>
    </>
  );
}
