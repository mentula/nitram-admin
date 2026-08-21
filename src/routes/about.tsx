import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import warehouseImg from "@/assets/nitram-about-team.jpg";

import { PageHero, CTAStrip } from "@/components/site/PageHero";
import { SectionHeading, FadeIn } from "@/components/site/Section";
import { Counter } from "@/components/site/Counter";
import { STATS, WHY_US } from "@/lib/site-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Nitram Logistics — Customs Clearing & Transit Cargo Experts" },
      { name: "description", content: "Nitram Logistics Limited: 20+ years of customs clearing, transit cargo management and logistics expertise across Zambia and Southern Africa. 5,000+ shipments cleared." },
      { property: "og:title", content: "About Nitram Logistics Limited" },
      { property: "og:description", content: "Zambia's trusted customs clearing and transit logistics partner with 20+ years of experience clearing 5,000+ shipments across SADC." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Nitram"
        title={<>Zambia's trusted partner for <span className="text-gradient-gold">cross-border cargo solutions.</span></>}
        description="Nitram Logistics Limited specialises in customs clearing, transit cargo management, export services and logistics consulting across Zambia and Southern Africa. For 20+ years, we've helped businesses move cargo without delays, errors or compliance failures."
      />

      <section className="py-24">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <FadeIn>
            <img src={warehouseImg} alt="Nitram Logistics team member at work" loading="lazy" className="rounded-2xl shadow-[var(--shadow-elegant)]" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <SectionHeading align="left" eyebrow="Our story" title="20+ years moving Zambia's cargo across borders" description="Founded to address the growing demand for professional, compliant and efficient border clearance services, Nitram has earned a reputation as a dependable partner for businesses that need their cargo to move without delays, errors or costly compliance failures." />
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {[
                { t: "Mission", d: "Deliver reliable, compliant and efficient customs and logistics solutions that enable clients to trade with confidence and grow across borders." },
                { t: "Vision", d: "Become Zambia's preferred customs clearing and transit logistics partner, recognised for expertise, reliability and excellence." },
                { t: "Approach", d: "Commitment, customer service, integrity and long-term partnerships. Not a side activity—we hold ourselves to a standard of excellence." },
                { t: "Experience", d: "5,000+ shipments cleared. 350+ businesses served across mining, manufacturing, agriculture, retail and government." },
              ].map((b) => (
                <div key={b.t} className="rounded-xl border border-border bg-card p-5">
                  <h4 className="font-display text-base font-bold">{b.t}</h4>
                  <p className="mt-1.5 text-sm text-muted-foreground">{b.d}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="container-x grid gap-10 text-center md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display text-5xl font-bold text-[var(--navy)]"><Counter to={s.value} suffix={s.suffix} /></p>
              <p className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Core values" title="What guides every decision we make" description="Everything at Nitram is guided by six core values that define our culture, conduct and commitments to our clients." />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Integrity", desc: "We conduct every aspect of our business with honesty, transparency and ethical responsibility. We never compromise on compliance." },
              { title: "Professionalism", desc: "Our team brings expertise, diligence and high standards to every task. We present ourselves and our work with pride." },
              { title: "Customer Focus", desc: "Our clients are at the centre of everything we do. We listen, respond and tailor our services to meet their specific needs." },
              { title: "Reliability", desc: "When we make a commitment, we keep it. Our clients depend on us and we take that responsibility seriously." },
              { title: "Accountability", desc: "We take ownership of our work and our outcomes. When challenges arise, we solve them. We don't shift blame." },
              { title: "Excellence", desc: "We continuously improve our processes, knowledge and service delivery to deliver the best possible outcomes for every client." },
            ].map((v) => (
              <FadeIn key={v.title}>
                <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6">
                  <h3 className="font-display text-lg font-bold text-[var(--gold)]">{v.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Why Nitram" title="What sets us apart" />
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map((w) => (
              <div key={w} className="flex items-start gap-3 rounded-xl border border-border bg-card px-5 py-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--gold)]" />
                <span className="text-sm font-medium">{w}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTAStrip />
    </>
  );
}
