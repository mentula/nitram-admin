import { createFileRoute } from "@tanstack/react-router";
import { PageHero, CTAStrip } from "@/components/site/PageHero";
import { FadeIn } from "@/components/site/Section";
import { INDUSTRIES } from "@/lib/site-data";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries We Serve — Nitram Logistics Limited" },
      { name: "description", content: "Specialised logistics for mining, manufacturing, agriculture, construction, retail, FMCG and industrial supply across Zambia." },
      { property: "og:title", content: "Industries — Nitram Logistics Limited" },
      { property: "og:description", content: "Sector-specialised logistics across Zambia's key industries." },
    ],
  }),
  component: IndustriesPage,
});

function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries we serve"
        title={<>Logistics expertise for <span className="text-gradient-gold">Zambia's leading sectors.</span></>}
        description="From the Copperbelt mines to FMCG distribution networks, we tailor our service to your sector's specific demands."
      />
      <section className="py-24">
        <div className="container-x grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((ind, i) => (
            <FadeIn key={ind.title} delay={i * 0.04}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:border-[var(--gold)]/40 hover:shadow-[var(--shadow-elegant)]">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--gold)]/10 blur-2xl transition group-hover:bg-[var(--gold)]/20" />
                <h3 className="relative font-display text-xl font-bold">{ind.title}</h3>
                <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">{ind.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
      <CTAStrip />
    </>
  );
}
