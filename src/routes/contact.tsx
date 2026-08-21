import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { FadeIn } from "@/components/site/Section";
import { COMPANY } from "@/lib/site-data";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Nitram Logistics Limited" },
      { name: "description", content: "Get in touch with Nitram Logistics Limited — phone, email, WhatsApp or visit our Lusaka office." },
      { property: "og:title", content: "Contact Nitram Logistics Limited" },
      { property: "og:description", content: "Reach our logistics team by phone, email or WhatsApp." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>Talk to our <span className="text-gradient-gold">logistics team.</span></>}
        description="Reach us by phone, email, WhatsApp — or visit us in Lusaka."
      />
      <section className="py-24">
        <div className="container-x grid gap-6 lg:grid-cols-4">
          {(() => {
            const waNumber = COMPANY.whatsapp.replace(/\D/g, "");
            const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello ${COMPANY.name}, I would like to get my free assessment regarding your logistics services.`)}`;
            const cards = [
              { icon: MapPin, title: "Office", lines: [COMPANY.address, COMPANY.hours], href: undefined as string | undefined, external: false },
              { icon: Phone, title: "Phone", lines: [COMPANY.phone, "24/7 logistics support"], href: COMPANY.phoneHref, external: false },
              { icon: Mail, title: "Email", lines: [COMPANY.email, "Response within hours"], href: `mailto:${COMPANY.email}`, external: false },
              { icon: MessageCircle, title: "WhatsApp", lines: [COMPANY.whatsappDisplay, "Quick chat & assessments"], href: waLink, external: true },
            ];
            return cards.map((c) => {
              const Inner = (
                <div className="h-full rounded-2xl border border-border bg-card p-7 text-center transition hover:-translate-y-1 hover:border-[var(--gold)]/40 hover:shadow-[var(--shadow-elegant)]">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[var(--navy)] text-[var(--gold)]">
                    <c.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold">{c.title}</h3>
                  {c.lines.map((l) => <p key={l} className="mt-1 text-sm text-muted-foreground">{l}</p>)}
                </div>
              );
              return (
                <FadeIn key={c.title}>
                  {c.href ? (
                    <a href={c.href} {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})} className="block h-full">{Inner}</a>
                  ) : Inner}
                </FadeIn>
              );
            });
          })()}
        </div>
        <FadeIn delay={0.1}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-elegant)]">
            <iframe
              title="Nitram office location"
              src="https://www.google.com/maps?q=Lusaka%2C+Zambia&output=embed"
              className="h-[260px] md:h-[460px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </FadeIn>
      </section>
    </>
  );
}
