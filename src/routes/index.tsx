import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Clock, Headphones, Award, Star, CheckCircle2, ChevronDown, Phone, Mail, MapPin, FileText, Eye } from "lucide-react";
import { useState } from "react";

import heroPort from "@/assets/nitram-worker-truck.jpg";
import warehouseImg from "@/assets/nitram-office-agent.jpg";
import trucksImg from "@/assets/nitram-truck-port.jpg";
import truckVideo from "@/assets/hero-truck.mp4.asset.json";
import { COMPANY, STATS, SERVICES, INDUSTRIES, WHY_US, LEADERSHIP, PROCESS, TESTIMONIALS, FAQS, RESOURCES, DOCUMENTS } from "@/lib/site-data";
import { SectionHeading, FadeIn } from "@/components/site/Section";
import { Counter } from "@/components/site/Counter";
import { QuoteForm } from "@/components/site/QuoteForm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${COMPANY.name} — Customs Clearing & Transit Cargo Solutions` },
      { name: "description", content: `Zambia's trusted customs clearing, transit cargo management and logistics partner. Fast 48-hour clearance, RIT expertise, ZRA-approved. Serving mining, manufacturing, agriculture and retail across Southern Africa.` },
      { property: "og:title", content: `${COMPANY.name} — Cross-Border Cargo Solutions` },
      { property: "og:description", content: "20+ years of customs clearing, transit cargo management and logistics expertise. 5,000+ shipments cleared. ZRA-approved with Transit Guarantee authorisation." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Overview />
      <Stats />
      <Services />
      <Industries />
      <WhyUs />
      <TransitGuaranteeHighlight />
      <Leadership />
      <Process />
      <Testimonials />
      <DocumentsPreview />
      <QuoteSection />
      <Contact />
      <FAQ />
      <News />
    </>
  );
}

function Hero() {
  return (
    <section className="relative -mt-16 md:-mt-20 overflow-hidden">
      {/* Backdrop: moving truck video */}
      <div className="absolute inset-0">
        <video
          src={truckVideo.url}
          poster={heroPort}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
      </div>



      <div className="relative z-10 container-x flex min-h-[60vh] md:min-h-[92vh] flex-col justify-center pt-20 md:pt-28 pb-16 md:pb-20 text-white">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" /> {COMPANY.tagline}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
        >
          Move Your Cargo Across Borders <span className="text-gradient-gold">Without Delays</span> or Compliance Failures
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 max-w-2xl text-base text-white/85 md:text-lg"
        >
          Nitram Logistics is Zambia's trusted customs clearing, transit cargo and logistics partner. We specialise in fast, compliant border clearance, RIT procedures and end-to-end cargo movement across the SADC region.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
        >
          <Link to="/assessment" className="group inline-flex w-full justify-center items-center gap-2 rounded-full bg-[var(--gold)] px-7 py-3.5 text-sm font-semibold text-[var(--navy-deep)] shadow-[var(--shadow-gold)] transition hover:brightness-110 sm:w-auto">
            Get Your Free Assessment <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
          <Link to="/contact" className="inline-flex w-full justify-center items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 sm:w-auto">
            Contact Us
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.45 }}
          className="mt-16 grid max-w-3xl gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md sm:grid-cols-3"
        >
          {[
            { icon: Award, label: "ZRA-registered agents" },
            { icon: ShieldCheck, label: "Trusted & secure" },
            { icon: Clock, label: "Fast clearance" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 bg-[var(--navy-deep)]/30 px-5 py-4">
              <Icon className="h-5 w-5 text-[var(--gold)]" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { icon: ShieldCheck, t: "ZRA-Approved Clearing Agents" },
    { icon: Clock, t: "48-Hour Clearance Target" },
    { icon: Award, t: "RIT Specialists" },
    { icon: Headphones, t: "24/7 Client Support" },
  ];
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="container-x grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
        {items.map(({ icon: Icon, t }) => (
          <div key={t} className="flex items-center justify-center gap-3 text-sm font-semibold text-foreground/80">
            <Icon className="h-5 w-5 text-[var(--gold)]" /> {t}
          </div>
        ))}
      </div>
    </section>
  );
}

function Overview() {
  return (
    <section id="about" className="py-24">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <FadeIn>
          <div className="relative">
            <img src={warehouseImg} alt="Nitram logistics operations" loading="lazy" width={1280} height={896} className="w-full h-auto rounded-2xl shadow-[var(--shadow-elegant)]" />
            <div className="absolute -bottom-6 -right-6 hidden rounded-2xl bg-[var(--navy)] p-6 text-white shadow-[var(--shadow-elegant)] md:block">
              <p className="font-display text-3xl font-bold text-[var(--gold)]"><Counter to={20} suffix="+" /></p>
              <p className="text-xs uppercase tracking-wider text-white/70">Years moving Zambia's cargo</p>
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <SectionHeading
            align="left"
            eyebrow="Specialists in Cross-Border Cargo"
            title={<>Customs clearing and logistics that <span className="text-gradient-gold">work for your business.</span></>}
            description={`Nitram Logistics is a Zambia-based specialist in customs clearing, transit cargo management (RIT), export management, trucking services and logistics consulting. We're a perfect fit for mining, manufacturing, agriculture, construction, retail, government and NGO operations requiring professional, compliant border clearance and regional logistics.`}
          />
          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {[
              { t: "Our Mission", d: "Deliver reliable, compliant and efficient customs and logistics solutions that enable clients to trade with confidence across borders." },
              { t: "Our Vision", d: "Become Zambia's preferred customs clearing and transit logistics partner, recognised for expertise, reliability and excellence." },
              { t: "20+ Years", d: "5,000+ shipments cleared and 350+ businesses served across manufacturing, mining, agriculture, construction, retail and government." },
              { t: "Our Edge", d: "Deep expertise in ZRA customs law, COMESA/SADC regulations, RIT procedures and end-to-end regional logistics network." },
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
  );
}

function Stats() {
  return (
    <section className="relative overflow-hidden bg-[var(--navy)] py-20 text-white">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${trucksImg})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0 bg-[var(--navy-deep)]/80" />
      <div className="container-x relative grid gap-10 text-center md:grid-cols-4">
        {STATS.map((s) => (
          <FadeIn key={s.label} className="">
            <p className="font-display text-5xl font-bold text-[var(--gold)] md:text-6xl">
              <Counter to={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-sm uppercase tracking-wider text-white/70">{s.label}</p>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="What we do"
          title="Comprehensive logistics & clearing services"
          description="From customs clearance to last-mile distribution, Nitram delivers end-to-end logistics solutions tailored to your cargo and corridor."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {SERVICES.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.05}>
              <article className="group h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--gold)]/40 hover:shadow-[var(--shadow-elegant)]">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--navy)] text-[var(--gold)] transition group-hover:bg-[var(--gold)] group-hover:text-[var(--navy-deep)]">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                <ul className="mt-4 space-y-1.5">
                  {s.benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs text-foreground/80">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[var(--gold)]" /> {b}
                    </li>
                  ))}
                </ul>
                <Link to="/assessment" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--navy)] hover:text-[var(--gold)]">
                  Get Your Free Assessment <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Industries() {
  return (
    <section id="industries" className="bg-secondary/40 py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Industries we serve"
          title="Trusted by Zambia's leading sectors"
          description="Specialised logistics expertise for the industries that drive the Zambian economy."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((ind, i) => (
            <FadeIn key={ind.title} delay={i * 0.04}>
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition hover:border-[var(--gold)]/40 hover:shadow-[var(--shadow-elegant)]">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--gold)]/10 blur-2xl transition group-hover:bg-[var(--gold)]/20" />
                <h3 className="relative font-display text-xl font-bold">{ind.title}</h3>
                <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">{ind.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  return (
    <section className="py-24">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <FadeIn>
          <SectionHeading
            align="left"
            eyebrow="Why Nitram"
            title={<>Compliance, speed, and reliability — <span className="text-gradient-gold">every consignment.</span></>}
            description="We combine deep regulatory expertise with a reliable logistics network so your cargo moves on time, every time."
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {WHY_US.map((w) => (
              <li key={w} className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--gold)]" />
                <span className="font-medium text-foreground/85">{w}</span>
              </li>
            ))}
          </ul>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="relative overflow-hidden rounded-2xl">
            <img src={heroPort} alt="Freight trucks on highway" loading="lazy" width={1280} height={896} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy-deep)]/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 glass rounded-xl p-5 text-white">
              <p className="font-display text-lg font-bold">End-to-end across SADC</p>
              <p className="mt-1 text-sm text-white/80">Chirundu, Kasumbalesa, Nakonde, Katima Mulilo & beyond.</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function TransitGuaranteeHighlight() {
  return (
    <section className="py-24">
      <div className="container-x">
        <FadeIn>
          <div className="rounded-3xl border border-[var(--gold)]/30 bg-gradient-to-br from-[var(--navy-deep)]/5 to-[var(--gold)]/5 p-10 md:p-16">
            <div className="flex flex-col items-center gap-8 text-center">
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-[var(--gold)]/20">
                <ShieldCheck className="h-10 w-10 text-[var(--gold)]" />
              </div>
              <div>
                <h2 className="font-display text-3xl font-bold md:text-4xl">
                  <span className="text-gradient-gold">ZRA Approved</span> Transit Guarantee Provider
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground mx-auto">
                  Nitram Logistics Limited is authorised by the Zambia Revenue Authority (ZRA) to provide customs transit guarantee services with a maximum authorised guarantee of <span className="font-semibold text-foreground">ZMW 40,000,000</span>, demonstrating our financial strength, compliance, and capability to handle high-value transit cargo across the region.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[var(--gold)]" />
                  <span className="text-sm font-semibold">Regulatory Approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[var(--gold)]" />
                  <span className="text-sm font-semibold">Financially Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[var(--gold)]" />
                  <span className="text-sm font-semibold">High-Capacity Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function Leadership() {
  return (
    <section id="leadership" className="bg-secondary/40 py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Leadership"
          title="Experienced people behind every shipment"
          description="Our experienced leadership team combines industry expertise, operational excellence, and a commitment to delivering reliable logistics solutions across Zambia and the region."
        />
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {LEADERSHIP.map((p, i) => (
            <FadeIn key={p.name} delay={i * 0.05}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
                <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-[var(--navy)] to-[var(--navy-deep)]">
                  <img
                    src={p.image}
                    alt={`${p.name} — ${p.role}`}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--gold)]" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-lg font-bold">{p.name}</h3>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gold)]">{p.role}</p>
                  <ul className="mt-4 space-y-1.5">
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
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="How it works"
          title="A simple, transparent process"
          description="From quote to delivery, you'll always know where your cargo is and what comes next."
        />
        <div className="relative mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {PROCESS.map((p, i) => (
            <FadeIn key={p.n} delay={i * 0.1}>
              <div className="relative text-center">
                <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[var(--gold)] bg-background font-display text-base font-bold text-[var(--navy)]">
                  {p.n}
                </div>
                <h3 className="mt-5 font-display text-lg font-bold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                {p.n === "05" && (
                  <>
                    <Link to="/appoint-nitram" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-6 py-2.5 text-xs font-semibold text-[var(--navy-deep)] transition hover:brightness-110">
                      Appoint Nitram on the ZRA Portal <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <p className="mt-4 text-xs text-muted-foreground italic">
                      This secure electronic appointment is required before we can submit customs declarations on your behalf.
                    </p>
                  </>
                )}
                {p.n !== "05" && (p.n === "01" || p.n === "02" || p.n === "03" || p.n === "04") && (
                  <Link to="/assessment" className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--gold)] bg-background px-6 py-2.5 text-xs font-semibold text-[var(--gold)] transition hover:bg-[var(--gold)]/10">
                    Get Assessment <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const [i, setI] = useState(0);
  const t = TESTIMONIALS[i];
  return (
    <section className="bg-[var(--navy)] py-24 text-white">
      <div className="container-x">
        <SectionHeading
          eyebrow="Client voices"
          title={<span className="text-white">What our clients say</span>}
        />
        <FadeIn>
          <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center backdrop-blur">
            <div className="flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-5 w-5 fill-[var(--gold)] text-[var(--gold)]" />)}
            </div>
            <p className="mt-6 font-display text-xl leading-relaxed md:text-2xl">"{t.quote}"</p>
            <p className="mt-6 text-sm font-semibold">{t.name}</p>
            <p className="text-xs text-white/60">{t.company}</p>
            <div className="mt-8 flex justify-center gap-2">
              {TESTIMONIALS.map((_, k) => (
                <button
                  key={k}
                  onClick={() => setI(k)}
                  aria-label={`Testimonial ${k + 1}`}
                  className={`h-2 rounded-full transition-all ${k === i ? "w-8 bg-[var(--gold)]" : "w-2 bg-white/30"}`}
                />
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function DocumentsPreview() {
  const featuredDocs = DOCUMENTS.filter((doc) => doc.src).slice(0, 3);
  return (
    <section className="bg-secondary/40 py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Compliance & Credentials"
          title="Verified, registered & compliant"
          description="A snapshot of our official certificates demonstrating regulatory standing and professionalism."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredDocs.map((doc, i) => (
            <FadeIn key={doc.title} delay={i * 0.06}>
              <Link
                to="/documents"
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:border-[var(--gold)]/40 hover:shadow-[var(--shadow-elegant)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[var(--navy)]/5 to-[var(--gold)]/5">
                  {doc.src ? (
                    <>
                      <img
                        src={doc.src}
                        alt={doc.title}
                        loading="lazy"
                        className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-[var(--navy-deep)]/0 transition group-hover:bg-[var(--navy-deep)]/50">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-[var(--navy-deep)] opacity-0 transition group-hover:opacity-100">
                          <Eye className="h-3.5 w-3.5" /> Preview
                        </span>
                      </span>
                    </>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
                      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--navy)]/10 text-[var(--navy)]">
                        <FileText className="h-7 w-7" />
                      </div>
                      <p className="text-xs">Document image coming soon</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-xs sm:text-[11px] font-semibold uppercase tracking-wider text-[var(--gold)]">
                    <ShieldCheck className="h-3.5 w-3.5" /> {doc.issuer}
                  </div>
                  <h3 className="mt-2 font-display text-base font-bold">{doc.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{doc.description}</p>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            to="/documents"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-elegant)] transition hover:bg-[var(--navy-deep)]"
          >
            View all company documents <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function QuoteSection() {
  return (
    <section id="quote" className="py-24">
      <div className="container-x grid gap-12 lg:grid-cols-2">
        <FadeIn>
          <SectionHeading
            align="left"
            eyebrow="Get started"
            title={<>Get your <span className="text-gradient-gold">free assessment.</span></>}
            description="Tell us about your cargo and route. We'll come back to you with a clear, competitive plan and pricing."
          />
          <div className="mt-8 space-y-4">
            {[
              { t: "Fast turnaround", d: "Most assessments returned within hours." },
              { t: "Transparent pricing", d: "Clear breakdown — no hidden fees." },
              { t: "Dedicated coordinator", d: "A single point of contact for your shipment." },
            ].map((x) => (
              <div key={x.t} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[var(--gold)]" />
                <div>
                  <p className="font-display text-base font-bold">{x.t}</p>
                  <p className="text-sm text-muted-foreground">{x.d}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="mx-auto w-full max-w-xl">
            <QuoteForm />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="bg-secondary/40 py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Contact"
          title="Get in touch with our team"
          description="Reach us by phone, email or WhatsApp — or visit us in Lusaka."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {[
            { icon: MapPin, title: "Office", lines: [COMPANY.address, COMPANY.hours] },
            { icon: Phone, title: "Phone", lines: [COMPANY.phone, "24/7 logistics support"] },
            { icon: Mail, title: "Email", lines: [COMPANY.email, "Response within hours"] },
          ].map((c) => (
            <FadeIn key={c.title}>
              <div className="h-full rounded-2xl border border-border bg-card p-7 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[var(--navy)] text-[var(--gold)]">
                  <c.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold">{c.title}</h3>
                {c.lines.map((l) => <p key={l} className="mt-1 text-sm text-muted-foreground">{l}</p>)}
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.1}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-elegant)]">
              <iframe
              title="Nitram office location"
              src="https://www.google.com/maps?q=Lusaka%2C+Zambia&output=embed"
              className="h-[260px] md:h-[380px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-24">
      <div className="container-x max-w-4xl">
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
        <div className="mt-12 divide-y divide-border rounded-2xl border border-border bg-card">
          {FAQS.map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={open === i}
              >
                <span className="font-display text-base font-semibold">{f.q}</span>
                <ChevronDown className={`h-5 w-5 flex-shrink-0 text-[var(--gold)] transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function News() {
  return (
    <section className="bg-secondary/40 py-24">
      <div className="container-x">
        <SectionHeading eyebrow="News & Resources" title="Industry insights & updates" description="Practical guides and updates from Zambia's logistics and customs landscape." />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {RESOURCES.map((r) => (
            <FadeIn key={r.title}>
              <article className="group h-full rounded-2xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
                <span className="inline-flex items-center rounded-full bg-[var(--navy)] px-3 py-1 text-xs sm:text-[10px] font-semibold uppercase tracking-wider text-[var(--gold)]">{r.tag}</span>
                <h3 className="mt-4 font-display text-lg font-bold leading-snug">{r.title}</h3>
                <p className="mt-3 text-xs text-muted-foreground">{r.date}</p>
                  <Link to="/blog" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--navy)] hover:text-[var(--gold)]">
                  Read more <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
