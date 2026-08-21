import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHero } from '@/components/site/PageHero';
import { FadeIn } from '@/components/site/Section';
import { TrackingProgress } from '@/components/tracking/TrackingProgress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Package, AlertCircle } from 'lucide-react';
import { COMPANY } from '@/lib/site-data';

export const Route = createFileRoute('/track')({
  head: () => ({
    meta: [
      { title: `Track Your Shipment — ${COMPANY.name}` },
      { 
        name: 'description', 
        content: 'Track your cargo clearance and delivery progress in real-time. Enter your tracking token to see the current status of your shipment.' 
      },
      { property: 'og:title', content: `Track Your Shipment — ${COMPANY.name}` },
      { property: 'og:description', content: 'Real-time shipment tracking for customs clearance and cargo delivery.' },
    ],
  }),
  component: TrackPage,
  validateSearch: (search: Record<string, unknown>): { token?: string } => {
    return {
      token: typeof search.token === 'string' ? search.token : undefined,
    };
  },
});

function TrackPage() {
  const { token: urlToken } = Route.useSearch();
  const [inputToken, setInputToken] = useState(urlToken || '');
  const [activeToken, setActiveToken] = useState(urlToken || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputToken.trim()) {
      setActiveToken(inputToken.trim().toUpperCase());
    }
  };

  const handleReset = () => {
    setInputToken('');
    setActiveToken('');
  };

  return (
    <>
      <PageHero
        eyebrow="Shipment Tracking"
        title={
          <>
            Track your <span className="text-gradient-gold">cargo</span> in real-time.
          </>
        }
        description="Enter your 8-character tracking token to see the current status of your shipment through customs clearance and delivery."
      />

      <section className="py-24">
        <div className="container-x max-w-4xl">
          {!activeToken ? (
            <FadeIn>
              <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-elegant)] md:p-12">
                <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--navy)] text-[var(--gold)]">
                  <Package className="h-8 w-8" />
                </div>

                <h2 className="text-center font-display text-2xl font-bold md:text-3xl">
                  Enter Your Tracking Token
                </h2>
                <p className="mt-3 text-center text-muted-foreground">
                  Your tracking token is an 8-character code provided by our team when your shipment was created.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="tracking-token" className="text-sm font-medium">
                      Tracking Token
                    </label>
                    <div className="relative">
                      <Input
                        id="tracking-token"
                        type="text"
                        placeholder="e.g., ABC12345"
                        value={inputToken}
                        onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                        maxLength={8}
                        className="h-12 pl-12 text-lg font-mono uppercase tracking-wider"
                        autoComplete="off"
                      />
                      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base"
                    disabled={inputToken.length !== 8}
                  >
                    Track Shipment
                  </Button>
                </form>

                <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-900">
                      <p className="font-medium">Don't have a tracking token?</p>
                      <p className="mt-1">
                        Contact our team at{' '}
                        <a href={`mailto:${COMPANY.email}`} className="font-semibold underline">
                          {COMPANY.email}
                        </a>
                        {' '}or{' '}
                        <a href={COMPANY.phoneHref} className="font-semibold underline">
                          {COMPANY.phone}
                        </a>
                        {' '}to get your tracking information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ) : (
            <TrackingProgress token={activeToken} onReset={handleReset} />
          )}
        </div>
      </section>
    </>
  );
}
