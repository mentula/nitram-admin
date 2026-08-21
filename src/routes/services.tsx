import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageHero, CTAStrip } from "@/components/site/PageHero";
import { FadeIn } from "@/components/site/Section";
import { SERVICES } from "@/lib/site-data";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Nitram Logistics Limited" },
      { name: "description", content: "Customs clearing, transit cargo management, trucking, export management and tailored logistics services across Zambia and Southern Africa." },
      { property: "og:title", content: "Logistics & Clearing Services — Nitram Logistics Limited" },
      { property: "og:description", content: "Comprehensive customs and logistics services for Zambian importers and exporters." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title={<>End-to-end logistics across <span className="text-gradient-gold">Zambia & SADC.</span></>}
        description="Whatever your cargo, route or industry, we have the people, licences and network to move it safely and on time."
      />
      <section className="py-24">
        <div className="container-x grid gap-6 md:grid-cols-2">
          {SERVICES.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.04}>
              <article className="group h-full rounded-2xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:border-[var(--gold)]/40 hover:shadow-[var(--shadow-elegant)]">
                <div className="flex items-start gap-5">
                  <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-xl bg-[var(--navy)] text-[var(--gold)]">
                    <s.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                    <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                      {s.benefits.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-xs text-foreground/80">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--gold)]" /> {b}
                        </li>
                      ))}
                    </ul>
                    <Link to="/assessment" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--navy)] hover:text-[var(--gold)]">
                      Get Your Free Assessment <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>
      <CTAStrip />
    </>
  );
}
