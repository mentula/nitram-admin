import { useEffect, useState } from "react";
import { ArrowUp, X, Phone } from "lucide-react";
import { COMPANY } from "@/lib/site-data";

const WELCOME = `Hello ${COMPANY.name}, I would like to get my free assessment regarding your logistics services.`;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.704.888.658 0 2.026-.43 2.512-1.018.214-.272.328-.43.328-.842 0-.187-.043-.358-.115-.53-.187-.358-2.063-1.246-2.42-1.39-.114-.043-.215-.057-.286-.057zm-2.795-13.99c-7.115 0-12.892 5.778-12.892 12.893 0 2.434.673 4.81 1.949 6.886l-2.063 6.054 6.27-2.005a12.815 12.815 0 0 0 6.733 1.892h.005c7.11 0 12.965-5.78 12.965-12.893 0-3.443-1.42-6.682-3.856-9.117a12.84 12.84 0 0 0-9.111-3.71zm0 23.602h-.005a10.78 10.78 0 0 1-5.45-1.491l-.387-.231-4.04 1.319 1.348-3.91-.255-.404a10.78 10.78 0 0 1-1.65-5.752c0-5.95 4.834-10.785 10.778-10.785 2.88 0 5.585 1.122 7.62 3.158a10.73 10.73 0 0 1 3.155 7.633c.005 5.95-4.834 10.463-10.776 10.463z" />
    </svg>
  );
}

export function FloatingActions() {
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waNumber = COMPANY.whatsapp.replace(/\D/g, "");
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(WELCOME)}`;

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[90vw] max-w-[calc(100vw-2.5rem)] sm:w-[300px] md:sm:w-[340px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="flex items-center justify-between gap-3 bg-[#075E54] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15">
                <WhatsAppIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">{COMPANY.name}</p>
                <p className="text-xs sm:text-[11px] text-white/80">Typically replies in minutes</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="bg-[#ECE5DD] px-4 py-5">
            <div className="relative max-w-[90%] rounded-lg rounded-tl-none bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm">
              Hello 👋 Welcome to {COMPANY.name}. How can we help you today?
              <span className="mt-1 block text-right text-xs sm:text-[10px] text-gray-400">now</span>
            </div>
          </div>
          <div className="bg-card p-3">
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:brightness-105"
            >
              <WhatsAppIcon className="h-4 w-4" /> Start Chat
            </a>
          </div>
        </div>
      )}

      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        <a
          href={COMPANY.phoneHref}
          aria-label="Call us"
          className="relative grid h-14 w-14 place-items-center rounded-full bg-[var(--gold)] text-white shadow-[var(--shadow-elegant)] transition hover:scale-105"
          title={`Call ${COMPANY.phone}`}
        >
          <Phone className="h-7 w-7" />
        </a>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Chat on WhatsApp"
          className="relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[var(--shadow-elegant)] transition hover:scale-105"
        >
          <span className="absolute inset-0 -z-0 animate-ping rounded-full bg-[#25D366] opacity-60" />
          <WhatsAppIcon className="relative h-7 w-7" />
        </button>
        {show && (
          <button
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="grid h-11 w-11 place-items-center rounded-full bg-[var(--navy)] text-white shadow-[var(--shadow-elegant)] transition hover:bg-[var(--navy-deep)]"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>
    </>
  );
}
