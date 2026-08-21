import { createFileRoute } from "@tanstack/react-router";
import { PageHero, CTAStrip } from "@/components/site/PageHero";
import { FadeIn } from "@/components/site/Section";
import { LEADERSHIP } from "@/lib/site-data";

export const Route = createFileRoute("/leadership")({
  head: () => ({
    meta: [
      { title: "Leadership — Nitram Logistics Limited" },
      { name: "description", content: "Meet the leadership team behind Nitram Logistics Limited." },
      { property: "og:title", content: "Leadership Team — Nitram" },
      { property: "og:description", content: "Decades of combined experience in Zambian and regional logistics." },
    ],
  }),
  component: LeadershipPage,
});

function LeadershipPage() {
  return (
    <>
      <PageHero
        eyebrow="Leadership"
        title={<>Experienced people behind <span className="text-gradient-gold">every shipment.</span></>}
        description="Our experienced leadership team combines industry expertise, operational excellence, and a commitment to delivering reliable logistics solutions across Zambia and the region."
      />
      <section className="py-24">
        <div className="container-x grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {LEADERSHIP.map((p, i) => (
            <FadeIn key={p.name} delay={i * 0.05}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
                <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-[var(--navy)] to-[var(--navy-deep)]">
                  <img
                    src={p.image}
                    alt={`${p.name} — ${p.role}`}
                    loading="lazy"
                    style={{ objectPosition: (p as { imagePosition?: string }).imagePosition ?? "center top" }}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--navy-deep)]/85 via-[var(--navy-deep)]/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="font-display text-2xl font-bold leading-tight text-white drop-shadow-sm">{p.name}</h3>
                    <p className="mt-1 text-xs sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">{p.role}</p>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--gold)]" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <ul className="space-y-1.5">
                    {p.qualifications.map((q) => (
                      <li key={q} className="flex gap-2 text-sm text-foreground/80">
                        <span className="mt-2 h-1 w-1 flex-none rounded-full bg-[var(--gold)]" />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.bio}</p>
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
