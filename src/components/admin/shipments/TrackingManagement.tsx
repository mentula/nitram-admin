import { useEffect, useState } from 'react';
import { 
  useTrackingByShipment, 
  useUpdateTrackingStep, 
  CLEARANCE_STEPS 
} from '@/lib/hooks/useTracking';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Copy, 
  ExternalLink, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface TrackingManagementProps {
  shipmentId: string;
}

export function TrackingManagement({ shipmentId }: TrackingManagementProps) {
  const { data: tracking, isLoading, refetch } = useTrackingByShipment(shipmentId);
  const updateStep = useUpdateTrackingStep();
  
  const [currentStep, setCurrentStep] = useState<number>(tracking?.current_step || 1);
  const [notes, setNotes] = useState(tracking?.notes || '');
  const [status, setStatus] = useState<'active' | 'completed' | 'cancelled'>(tracking?.status || 'active');

  // Update local state when tracking data changes
  useEffect(() => {
    if (tracking) {
      setCurrentStep(tracking.current_step);
      setNotes(tracking.notes || '');
      setStatus(tracking.status as 'active' | 'completed' | 'cancelled');
    }
  }, [tracking]);

  const trackingUrl = tracking 
    ? `${window.location.origin}/track?token=${tracking.token}`
    : '';

  const handleCopyToken = () => {
    if (tracking) {
      navigator.clipboard.writeText(tracking.token);
      toast.success('Tracking token copied to clipboard');
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(trackingUrl);
    toast.success('Tracking URL copied to clipboard');
  };

  const handleUpdate = async () => {
    if (!tracking) return;

    try {
      await updateStep.mutateAsync({
        id: tracking.id,
        current_step: currentStep,
        notes: notes || undefined,
        status,
      });
      toast.success('Tracking updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update tracking');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-amber-900">No Tracking Token</h4>
            <p className="mt-1 text-sm text-amber-700">
              This shipment doesn't have a tracking token yet. Tracking tokens are automatically
              generated when shipments are created.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tracking Token Display */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="font-medium text-green-900">Tracking Token</h4>
            <div className="mt-2 flex items-center gap-2">
              <code className="rounded bg-white px-3 py-1.5 font-mono text-lg font-bold text-green-900">
                {tracking.token}
              </code>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleCopyToken}
                className="text-green-700 hover:text-green-900"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-700">
              Status: <span className="font-semibold capitalize">{tracking.status}</span>
            </p>
            <p className="text-xs text-green-600 mt-1">
              Current Step: {tracking.current_step}/8
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={trackingUrl}
            readOnly
            className="flex-1 rounded border border-green-300 bg-white px-3 py-1.5 text-sm text-gray-700"
          />
          <Button size="sm" variant="outline" onClick={handleCopyUrl}>
            <Copy className="h-4 w-4 mr-1" />
            Copy URL
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              Open
            </a>
          </Button>
        </div>
      </div>

      {/* Update Tracking Form */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Update Tracking Progress</h4>

        <div className="space-y-2">
          <Label htmlFor="current-step">Current Step</Label>
          <Select
            value={currentStep.toString()}
            onValueChange={(value) => setCurrentStep(parseInt(value))}
          >
            <SelectTrigger id="current-step">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLEARANCE_STEPS.map((step) => (
                <SelectItem key={step.step} value={step.step.toString()}>
                  Step {step.step}: {step.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {CLEARANCE_STEPS.find(s => s.step === currentStep)?.description}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(value: 'active' | 'completed' | 'cancelled') => setStatus(value)}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Update Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about the current status (visible to clients)..."
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            These notes will be visible to the client when they track their shipment.
          </p>
        </div>

        <Button 
          onClick={handleUpdate} 
          disabled={updateStep.isPending}
          className="w-full"
        >
          {updateStep.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Update Tracking
            </>
          )}
        </Button>
      </div>

      {/* Step Preview */}
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <h4 className="text-sm font-medium mb-3">Progress Preview</h4>
        <div className="space-y-2">
          {CLEARANCE_STEPS.slice(0, 4).map((step) => (
            <div key={step.step} className="flex items-center gap-3 text-sm">
              {step.step < currentStep ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              ) : step.step === currentStep ? (
                <div className="h-4 w-4 rounded-full border-2 border-primary flex-shrink-0" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
              )}
              <span className={step.step === currentStep ? 'font-medium' : 'text-muted-foreground'}>
                {step.title}
              </span>
            </div>
          ))}
          {currentStep > 4 && (
            <p className="text-xs text-muted-foreground pl-7">
              ... and {8 - currentStep} more steps
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
