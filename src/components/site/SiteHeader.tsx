import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { COMPANY } from "@/lib/site-data";
import logoUrl from "@/assets/nitram-logo-mark.jpg";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/industries", label: "Industries" },
  { to: "/leadership", label: "Leadership" },
  { to: "/documents", label: "Documents" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4 md:h-20">
        <Link to="/" className="flex items-center gap-2.5" aria-label={`${COMPANY.name} — Home`}>
          <img src={logoUrl} alt={COMPANY.name} width={44} height={44} className="h-10 w-10 md:h-11 md:w-11 rounded-md" />
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="font-display text-lg font-bold text-[var(--navy-deep)]">NITRAM</span>
            <span className="text-sm sm:text-xs font-semibold uppercase tracking-[0.15em] text-[var(--brand-green)]">Logistics Limited</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="relative text-base font-semibold text-foreground/80 transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:bg-[var(--gold)]" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-4">
          <a href={COMPANY.phoneHref} className="hidden items-center gap-2 text-base font-medium text-foreground/80 hover:text-foreground sm:flex whitespace-nowrap">
            <Phone className="h-4 w-4 text-[var(--gold)] flex-shrink-0" /> {COMPANY.phone}
          </a>
          <Link
            to="/assessment"
            className="hidden rounded-full bg-[var(--navy)] px-5 py-3 text-base sm:px-6 sm:py-3 sm:text-lg font-semibold text-white shadow-[var(--shadow-elegant)] transition hover:bg-[var(--navy-deep)] sm:inline-flex whitespace-nowrap"
          >
            Get Quote
          </Link>
          <button
            aria-controls="site-navigation"
            aria-expanded={open}
            aria-label={open ? "Close mobile menu" : "Open mobile menu"}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-md border border-border md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="site-navigation" role="navigation" aria-label="Primary mobile navigation" aria-hidden={!open} className="border-t border-border bg-background lg:hidden">
          <div className="container-x flex flex-col gap-1 py-4">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted"
                activeProps={{ className: "text-foreground bg-muted" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <Link to="/assessment" className="mt-2 rounded-full bg-[var(--navy)] px-6 py-3 text-center text-base font-semibold text-white">
              Get Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
