import { useTrackingByToken, CLEARANCE_STEPS } from '@/lib/hooks/useTracking';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  Package, 
  AlertCircle,
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  Clock,
} from 'lucide-react';
import { FadeIn } from '@/components/site/Section';
import { format } from 'date-fns';

interface TrackingProgressProps {
  token: string;
  onReset: () => void;
}

export function TrackingProgress({ token, onReset }: TrackingProgressProps) {
  const { data: tracking, isLoading, error } = useTrackingByToken(token);

  if (isLoading) {
    return (
      <FadeIn>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading tracking information...</p>
        </div>
      </FadeIn>
    );
  }

  if (error || !tracking) {
    return (
      <FadeIn>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 md:p-12">
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-red-100 text-red-600">
            <AlertCircle className="h-8 w-8" />
          </div>

          <h2 className="text-center font-display text-2xl font-bold text-red-900">
            Tracking Token Not Found
          </h2>
          <p className="mt-3 text-center text-red-700">
            We couldn't find any shipment with tracking token <span className="font-mono font-bold">{token}</span>.
          </p>
          <p className="mt-2 text-center text-sm text-red-600">
            Please check the token and try again, or contact our team for assistance.
          </p>

          <div className="mt-6 flex justify-center">
            <Button onClick={onReset} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Try Another Token
            </Button>
          </div>
        </div>
      </FadeIn>
    );
  }

  const currentStep = tracking.current_step;
  const shipment = tracking.shipment;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <FadeIn>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)] md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--navy)] text-[var(--gold)]">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold md:text-2xl">
                    Tracking: {token}
                  </h2>
                  {shipment && (
                    <p className="text-sm text-muted-foreground">
                      Shipment #{shipment.shipment_number}
                    </p>
                  )}
                </div>
              </div>

              {shipment && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Route
                      </p>
                      <p className="mt-1 font-medium">
                        {shipment.origin} → {shipment.destination}
                      </p>
                    </div>
                  </div>

                  {shipment.cargo_description && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Cargo
                        </p>
                        <p className="mt-1 font-medium">{shipment.cargo_description}</p>
                      </div>
                    </div>
                  )}

                  {shipment.eta && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Estimated Arrival
                        </p>
                        <p className="mt-1 font-medium">
                          {format(new Date(shipment.eta), 'PPP')}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Started
                      </p>
                      <p className="mt-1 font-medium">
                        {format(new Date(shipment.created_at), 'PPP')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button onClick={onReset} variant="ghost" size="sm" className="gap-2 flex-shrink-0">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>

          {/* Status Badge */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2">
            <div className={`h-2 w-2 rounded-full ${
              tracking.status === 'completed' 
                ? 'bg-green-500' 
                : tracking.status === 'cancelled'
                ? 'bg-red-500'
                : 'bg-blue-500 animate-pulse'
            }`} />
            <span className="text-sm font-medium capitalize">
              {tracking.status === 'completed' 
                ? 'Delivered' 
                : tracking.status === 'cancelled'
                ? 'Cancelled'
                : 'In Progress'}
            </span>
          </div>
        </div>
      </FadeIn>

      {/* Progress Steps */}
      <FadeIn delay={0.1}>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)] md:p-8">
          <h3 className="font-display text-lg font-bold md:text-xl">Clearance Process</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your shipment is currently at step {currentStep} of 8
          </p>

          <div className="mt-8 space-y-4">
            {CLEARANCE_STEPS.map((step, index) => {
              const isCompleted = step.step < currentStep;
              const isCurrent = step.step === currentStep;
              const isUpcoming = step.step > currentStep;

              return (
                <div
                  key={step.step}
                  className={`relative flex gap-4 ${
                    index !== CLEARANCE_STEPS.length - 1 ? 'pb-4' : ''
                  }`}
                >
                  {/* Connector Line */}
                  {index !== CLEARANCE_STEPS.length - 1 && (
                    <div
                      className={`absolute left-5 top-12 h-full w-0.5 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}

                  {/* Step Icon */}
                  <div className="relative flex-shrink-0">
                    {isCompleted ? (
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-green-500 text-white">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    ) : isCurrent ? (
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--navy)] text-[var(--gold)] ring-4 ring-[var(--navy)]/20">
                        <span className="font-bold">{step.step}</span>
                      </div>
                    ) : (
                      <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-gray-200 bg-white text-gray-400">
                        <Circle className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className={`flex-1 ${isUpcoming ? 'opacity-50' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className={`font-semibold ${isCurrent ? 'text-[var(--navy)]' : ''}`}>
                          {step.title}
                        </h4>
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                      {isCurrent && (
                        <span className="flex-shrink-0 rounded-full bg-[var(--navy)] px-3 py-1 text-xs font-semibold text-white">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {tracking.events?.length > 0 && (
        <FadeIn delay={0.2}>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)] md:p-8">
            <h3 className="font-display text-lg font-semibold">Shipment Updates</h3>
            <div className="mt-5 flex flex-col gap-4">
              {[...tracking.events].reverse().map((event: any) => (
                <div key={event.id} className="flex gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="font-medium capitalize">{String(event.status).replaceAll('_', ' ')}</p>
                    {event.notes && <p className="mt-1 text-sm text-muted-foreground">{event.notes}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">{format(new Date(event.created_at), 'PPP p')}{event.location ? ` · ${event.location}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      )}

      {/* Admin Notes */}
      {tracking.notes && (
        <FadeIn delay={0.2}>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 md:p-8">
            <h3 className="font-display text-lg font-semibold text-blue-900">
              Latest Update
            </h3>
            <p className="mt-3 text-blue-800 leading-relaxed whitespace-pre-line">
              {tracking.notes}
            </p>
            <p className="mt-4 text-xs text-blue-600">
              Last updated: {format(new Date(tracking.updated_at), 'PPP p')}
            </p>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
