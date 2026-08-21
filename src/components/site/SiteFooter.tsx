import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Linkedin, Facebook, Twitter } from "lucide-react";
import { COMPANY, SERVICES } from "@/lib/site-data";
import logoUrl from "@/assets/nitram-logo-mark.jpg";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-[var(--navy-deep)] text-white/80">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-lg bg-white p-1.5 shadow-sm">
              <img src={logoUrl} alt={COMPANY.name} width={48} height={48} className="h-11 w-11 rounded" />
            </span>
            <div className="leading-tight">
              <div className="font-display text-xl font-bold text-white">NITRAM</div>
              <div className="text-sm sm:text-xs font-semibold uppercase tracking-[0.15em] text-[var(--brand-green)]">Logistics Limited</div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed">
            Trusted partner for customs clearing, transit cargo, trucking and export logistics across Zambia and Southern Africa.
          </p>
          <div className="mt-5 flex gap-3">
            {[Linkedin, Facebook, Twitter].map((Icon, i) => (
              <a key={i} href="#" aria-label="Social link" className="grid h-9 w-9 place-items-center rounded-full border border-white/15 transition hover:border-[var(--gold)] hover:text-[var(--gold)]">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-base font-semibold uppercase tracking-wider text-white">Services</h4>
          <ul className="mt-4 space-y-3 text-base">
            {SERVICES.map((s) => (
              <li key={s.title}><Link to="/services" className="hover:text-[var(--gold)]">{s.title}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-base font-semibold uppercase tracking-wider text-white">Company</h4>
          <ul className="mt-4 space-y-3 text-base">
            <li><Link to="/about" className="hover:text-[var(--gold)]">About Us</Link></li>
            <li><Link to="/leadership" className="hover:text-[var(--gold)]">Leadership</Link></li>
            <li><Link to="/industries" className="hover:text-[var(--gold)]">Industries</Link></li>
            <li><Link to="/documents" className="hover:text-[var(--gold)]">Company Documents</Link></li>
            <li><Link to="/blog" className="hover:text-[var(--gold)]">Blog</Link></li>
            <li><Link to="/assessment" className="hover:text-[var(--gold)]">Get Your Free Assessment</Link></li>
            <li><Link to="/privacy" className="hover:text-[var(--gold)]">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-[var(--gold)]">Terms & Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-base font-semibold uppercase tracking-wider text-white">Contact</h4>
          <ul className="mt-4 space-y-4 text-base">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-[var(--gold)]" /> {COMPANY.address}</li>
            <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-[var(--gold)]" /> <a href={COMPANY.phoneHref} className="hover:text-[var(--gold)]">{COMPANY.phone}</a></li>
            <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-[var(--gold)]" /> <a href={COMPANY.landlineHref} className="hover:text-[var(--gold)]">{COMPANY.landline}</a> <span className="text-white/50">(Landline)</span></li>
            <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 text-[var(--gold)]" /> <a href={`mailto:${COMPANY.email}`} className="hover:text-[var(--gold)]">{COMPANY.email}</a></li>
            <li className="text-white/60 text-sm">{COMPANY.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/60 md:flex-row">
          <p>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
          <p>Intelligent, Innovative, Customised Logistics.</p>
        </div>
      </div>
    </footer>
  );
}
