import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, Zap, ArrowRight } from "lucide-react";

const INTERVAL_MS = 3 * 60 * 1000;
const STORAGE_KEY = "nitram_promo_last_shown";

export function PromoPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const show = () => {
      setOpen(true);
      try { localStorage.setItem(STORAGE_KEY, Date.now().toString()); } catch { /* ignore */ }
    };

    let interval: number | undefined;
    const first = window.setTimeout(() => {
      show();
      interval = window.setInterval(show, INTERVAL_MS);
    }, 1500);

    return () => {
      window.clearTimeout(first);
      if (interval) window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-title"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-md max-h-[92dvh] overflow-y-auto overscroll-contain rounded-2xl bg-card shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
        <div className="relative bg-gradient-to-br from-[var(--navy)] to-[var(--navy-deep)] px-5 sm:px-6 pt-7 pb-5 sm:pb-6 text-white">
          <button
            onClick={() => setOpen(false)}
            aria-label="Close popup"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/90 transition hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)]/20 px-3 py-1 text-xs sm:text-[11px] font-semibold uppercase tracking-wider text-[var(--gold)]">
            <Zap className="h-3.5 w-3.5" /> Limited offer
          </div>
          <h2 id="promo-title" className="mt-3 sm:mt-4 pr-10 font-display text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
            Get Your Cargo Cleared in 48 Hours
          </h2>
        </div>
        <div className="px-5 sm:px-6 py-5 sm:py-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Get yourself a free assessment today — fast, reliable customs clearance at any Zambian port of entry.
          </p>
          <div className="mt-5 sm:mt-6 flex flex-col gap-2 sm:flex-row">
            <Link
              to="/assessment"
              onClick={() => setOpen(false)}
              className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[var(--navy-deep)] shadow-[var(--shadow-gold)] transition hover:brightness-110"
            >
              Get Your Free Assessment <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground/80 transition hover:bg-muted"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
