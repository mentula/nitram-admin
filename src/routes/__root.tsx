import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/contexts/AuthContext";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FloatingActions } from "@/components/site/FloatingActions";
import { PromoPopup } from "@/components/site/PromoPopup";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Try again
          </button>
          <a href="/" className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nitram Logistics Limited — Customs Clearing & Logistics in Zambia" },
      { name: "description", content: "Nitram Logistics Limited delivers trusted customs clearing, transit cargo, trucking and export logistics across Zambia and Southern Africa." },
      { name: "author", content: "Nitram Logistics Limited" },
      { name: "theme-color", content: "#0f1a3a" },
      { property: "og:title", content: "Nitram Logistics Limited — Customs Clearing & Logistics in Zambia" },
      { property: "og:description", content: "Trusted customs clearing, transit cargo, trucking and export logistics across Zambia and Southern Africa." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Nitram Logistics Limited" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Nitram Logistics Limited — Customs Clearing & Logistics in Zambia" },
      { name: "twitter:description", content: "Trusted customs clearing, transit cargo, trucking and export logistics across Zambia and Southern Africa." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/CR2M1jIhy6btu6TJZQCjZQVF0WB3/social-images/social-1781076850055-1781075907341.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/CR2M1jIhy6btu6TJZQCjZQVF0WB3/social-images/social-1781076850055-1781075907341.webp" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Nitram Logistics Limited",
          url: "https://nitramclearing.co.zm",
          email: "info@nitramclearing.co.zm",
          telephone: "+260 211 840 755",
          address: { "@type": "PostalAddress", addressLocality: "Lusaka", addressCountry: "ZM" },
          areaServed: "Zambia",
          description: "Customs clearing, transit cargo management, trucking, and export management services across Zambia and Southern Africa.",
        }),
      },
      {
        async: true,
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXXX",
        crossorigin: "anonymous",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdminRoute = pathname.startsWith('/admin') || pathname === '/login';
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex min-h-screen flex-col bg-background">
          {!isAdminRoute && <SiteHeader />}
          <main className="flex-1">
            <Outlet />
          </main>
          {!isAdminRoute && <SiteFooter />}
          {!isAdminRoute && <FloatingActions />}
          {!isAdminRoute && <PromoPopup />}
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}
