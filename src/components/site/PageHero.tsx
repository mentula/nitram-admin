import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export function PageHero({ eyebrow, title, description, cta }: { eyebrow?: string; title: ReactNode; description?: ReactNode; cta?: ReactNode }) {
  return (
    <section className="relative -mt-16 md:-mt-20 overflow-hidden bg-[var(--navy)] pb-20 pt-36 text-white md:pb-28 md:pt-44">
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: "radial-gradient(circle at 20% 30%, var(--gold) 0%, transparent 40%), radial-gradient(circle at 80% 70%, var(--navy-deep) 0%, transparent 50%)",
      }} />
      <div className="absolute inset-0 bg-[var(--navy-deep)]/40" />
      <div className="container-x relative">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />{eyebrow}
          </span>
        )}
        <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">{title}</h1>
        {description && <p className="mt-5 max-w-2xl text-base text-white/80 md:text-lg">{description}</p>}
        {cta && <div className="mt-8">{cta}</div>}
      </div>
    </section>
  );
}

export function CTAStrip() {
  return (
    <section className="py-20">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--navy)] to-[var(--navy-deep)] p-10 text-white md:p-14">
          <div className="absolute -right-8 -top-8 hidden md:block h-40 md:h-72 w-40 md:w-72 rounded-full bg-[var(--gold)]/20 blur-3xl" />
          <div className="relative grid items-center gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-display text-3xl font-bold md:text-4xl">Ready to move your cargo?</h3>
              <p className="mt-3 text-white/80">Get a free assessment and a clearance plan from our team today.</p>
            </div>
            <div className="flex flex-wrap justify-start gap-3 md:justify-end">
              <Link to="/assessment" className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-7 py-3 text-sm font-semibold text-[var(--navy-deep)] shadow-[var(--shadow-gold)] hover:brightness-110">
                Get Your Free Assessment <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3 text-sm font-semibold text-white hover:bg-white/20">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
