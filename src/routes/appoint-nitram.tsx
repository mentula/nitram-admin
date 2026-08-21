import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  FileCheck2,
  Building2,
  Zap,
  LogIn,
  Search,
  MousePointerClick,
  Send,
  BellRing,
  Settings2,
  ExternalLink,
  MessageCircle,
  Phone,
  Home,
  CheckCircle2,
} from "lucide-react";
import { COMPANY } from "@/lib/site-data";
import { CONTACT, buildWhatsAppLink } from "@/config/contact";
import heroImage from "@/assets/appoint-nitram-hero.jpeg";

// Configurable ZRA appointment URL — update here to change everywhere.
const ZRA_PORTAL_URL =
  "https://portal-customs.zra.org.zm/#error=login_required&state=04359b30-f458-4165-97dd-3d5a0059bb80";

export const Route = createFileRoute("/appoint-nitram")({
  head: () => ({
    meta: [
      { title: `Appoint Nitram on the ZRA Portal — ${COMPANY.name}` },
      {
        name: "description",
        content:
          "Final step: authorise Nitram Logistics Limited as your licensed clearing agent through the Zambia Revenue Authority (ZRA) online portal so we can begin your customs clearance.",
      },
      { property: "og:title", content: `Appoint Nitram on the ZRA Portal — ${COMPANY.name}` },
      {
        property: "og:description",
        content:
          "Authorise Nitram Logistics Limited on the ZRA online portal to begin your customs clearance.",
      },
    ],
  }),
  component: AppointNitramPage,
});

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Authorises Nitram to Act for You",
    text: "Formally authorises Nitram Logistics Limited to act as your licensed customs clearing agent.",
  },
  {
    icon: FileCheck2,
    title: "A ZRA Requirement",
    text: "A Zambia Revenue Authority requirement before any customs declarations can be submitted on your behalf.",
  },
  {
    icon: Building2,
    title: "Protects Your Business",
    text: "Ensures only an authorised clearing agent can process your import or export transactions.",
  },
  {
    icon: Zap,
    title: "Faster Clearance",
    text: "Enables faster processing and direct communication with the Zambia Revenue Authority.",
  },
];

const STEPS = [
  { icon: LogIn, title: "Log in", text: "Sign in to your Zambia Revenue Authority (ZRA) online portal account." },
  { icon: Settings2, title: "Open Agent Section", text: "Navigate to the section for appointing a licensed customs clearing agent." },
  { icon: Search, title: "Search for Nitram", text: "Search for Nitram Logistics Limited in the list of licensed clearing agents." },
  { icon: MousePointerClick, title: "Select Nitram", text: "Select Nitram Logistics Limited as your authorised clearing agent." },
  { icon: Send, title: "Confirm & Submit", text: "Confirm your selection and submit the appointment on the portal." },
  { icon: BellRing, title: "Notify Our Team", text: "Let us know once the appointment is complete so we can begin processing your clearance." },
];

function AppointNitramPage() {
  const waLink = buildWhatsAppLink(
    `Hello ${COMPANY.name}, I need assistance appointing Nitram on the ZRA Portal.`
  );

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[var(--navy-deep)] pt-28 pb-20 text-white md:pt-32 md:pb-28">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--navy-deep)]/90 via-[var(--navy)]/85 to-[var(--navy-deep)]/95" aria-hidden />

        <div className="container-x grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs sm:text-[11px] font-semibold uppercase tracking-[0.18em]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" /> Final Step
            </span>
            <h1 className="mt-5 font-display text-3xl font-bold leading-tight md:text-5xl">
              Appoint Nitram on the{" "}
              <span className="text-gradient-gold">ZRA Portal</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
              To authorise {COMPANY.name} to act on your behalf, you must appoint us as your licensed clearing agent through the Zambia Revenue Authority (ZRA) online portal. This secure electronic appointment is required before we can prepare and submit customs declarations for you.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <a
                href={ZRA_PORTAL_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full justify-center items-center gap-2 rounded-full bg-[var(--gold)] px-7 py-3.5 text-sm font-semibold text-[var(--navy-deep)] shadow-[var(--shadow-gold)] transition hover:brightness-110"
              >
                Appoint Nitram on the ZRA Portal <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full justify-center items-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-semibold text-white shadow transition hover:brightness-105"
              >
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
              <a
                href={CONTACT.phoneHref}
                className="inline-flex w-full justify-center items-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Phone className="h-4 w-4" /> Call Our Team
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-2xl">
              <img
                src={heroImage}
                alt="Appointing Nitram Logistics Limited on the ZRA Portal"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
            <div className="pointer-events-none absolute -bottom-4 -right-4 hidden rounded-2xl bg-[var(--gold)]/95 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--navy-deep)] shadow-xl md:block">
              Licensed Clearing Agent
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why */}
      <section className="py-20">
        <div className="container-x">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">Why this matters</span>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl">
              Why do I need to appoint Nitram?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Electronic appointment on the ZRA portal is a legal prerequisite that protects your business and keeps clearance moving quickly.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="group relative rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-[var(--gold)]/40 hover:shadow-[var(--shadow-elegant)]"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--navy)] text-[var(--gold)]">
                  <r.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-base font-bold text-foreground">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How to appoint — timeline */}
      <section className="bg-muted/40 py-20">
        <div className="container-x">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">Step-by-step</span>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl">
              How to appoint Nitram on the ZRA Portal
            </h2>
            <p className="mt-3 text-muted-foreground">
              Six short steps. It should take less than five minutes.
            </p>
          </div>

          <ol className="relative mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="absolute -top-3 left-6 grid h-8 w-8 place-items-center rounded-full bg-[var(--gold)] text-xs font-black text-[var(--navy-deep)] shadow-md">
                  {i + 1}
                </div>
                <div className="mt-3 grid h-11 w-11 place-items-center rounded-xl bg-[var(--navy)]/5 text-[var(--navy)]">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </motion.li>
            ))}
          </ol>

          {/* Primary CTA */}
          <div className="mt-14 rounded-3xl border border-[var(--gold)]/30 bg-gradient-to-br from-[var(--navy)] to-[var(--navy-deep)] p-8 text-center text-white shadow-[var(--shadow-elegant)] md:p-12">
            <h3 className="font-display text-2xl font-bold md:text-3xl">
              Ready to authorise Nitram?
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-white/80">
              Click below to open the official ZRA online portal in a new tab and complete your appointment.
            </p>
            <a
              href={ZRA_PORTAL_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-8 py-4 text-sm font-semibold text-[var(--navy-deep)] shadow-[var(--shadow-gold)] transition hover:brightness-110 md:text-base"
            >
              Appoint Nitram on the ZRA Portal <ExternalLink className="h-5 w-5" />
            </a>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow transition hover:brightness-105"
              >
                <MessageCircle className="h-4 w-4" /> Need Assistance? Chat on WhatsApp
              </a>
              <a
                href={CONTACT.phoneHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Phone className="h-4 w-4" /> Call Our Team
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Success banner + return home */}
      <section className="py-20">
        <div className="container-x">
          <div className="rounded-3xl border border-[var(--brand-green)]/30 bg-[var(--brand-green)]/10 p-8 md:p-10">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--brand-green)]/20 text-[var(--brand-green)]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold text-foreground md:text-xl">
                  What happens after you appoint us
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80 md:text-base">
                  Once you have successfully appointed {COMPANY.name} on the ZRA Portal, our customs team will immediately begin processing your shipment and keep you informed throughout the clearance process.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground/90 transition hover:bg-muted"
            >
              <Home className="h-4 w-4" /> Return to Home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
