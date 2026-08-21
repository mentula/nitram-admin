import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Eye, X, ShieldCheck, FileText } from "lucide-react";
import { PageHero, CTAStrip } from "@/components/site/PageHero";
import { FadeIn, SectionHeading } from "@/components/site/Section";
import { DOCUMENTS, COMPANY } from "@/lib/site-data";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: `Company Documents — ${COMPANY.name}` },
      { name: "description", content: `Official compliance and registration documents for ${COMPANY.name} — tax clearance, clearing licence and business registration certificates.` },
      { property: "og:title", content: `Company Documents — ${COMPANY.name}` },
      { property: "og:description", content: "View our official ZRA, tax clearance and business registration certificates." },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox]);

  return (
    <>
      <PageHero
        eyebrow="Compliance & Credentials"
        title={<>Our official <span className="text-gradient-gold">company documents.</span></>}
        description={`These documents demonstrate the compliance, professionalism and regulatory standing of ${COMPANY.name}. Each certificate can be previewed or downloaded below.`}
      />

      <section className="py-20">
        <div className="container-x">
          <SectionHeading
            eyebrow="Trust & Transparency"
            title="Verified, registered & compliant"
            description="We maintain full regulatory compliance with the Zambia Revenue Authority and other relevant authorities."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {DOCUMENTS.map((doc, i) => (
              <FadeIn key={doc.title} delay={i * 0.06}>
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:border-[var(--gold)]/40 hover:shadow-[var(--shadow-elegant)]">
                  <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-[var(--navy)]/5 to-[var(--gold)]/5">
                    {doc.src ? (
                      <button
                        type="button"
                        onClick={() => setLightbox(doc.src)}
                        className="block h-full w-full"
                        aria-label={`Preview ${doc.title}`}
                      >
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
                      </button>
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
                        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--navy)]/10 text-[var(--navy)]">
                          <FileText className="h-8 w-8" />
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
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{doc.description}</p>
                    <div className="mt-4 flex gap-2">
                      {doc.src && (
                        <>
                          <button
                            onClick={() => setLightbox(doc.src)}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-muted"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                          <a
                            href={doc.src}
                            download
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--navy)] px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-[var(--navy-deep)]"
                          >
                            <Download className="h-3.5 w-3.5" /> Download
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <CTAStrip />

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightbox(null)}
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
          <button
            onClick={() => setLightbox(null)}
            aria-label="Close preview"
            className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightbox}
            alt="Document preview"
            className="relative max-h-[92vh] max-w-[96vw] rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          />
          <a
            href={lightbox}
            download
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 inline-flex min-w-[210px] justify-center items-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[var(--navy-deep)] shadow-[var(--shadow-gold)] transition hover:brightness-110 sm:left-auto sm:right-6 sm:translate-x-0"
          >
            <Download className="h-4 w-4" /> Download
          </a>
        </div>
      )}
    </>
  );
}
