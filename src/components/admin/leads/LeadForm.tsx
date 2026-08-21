import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { Database } from '@/lib/database.types';

type Lead = Database['public']['Tables']['leads']['Row'];
type LeadStatus = Database['public']['Enums']['lead_status'];

const leadSchema = z.object({
  contact_name: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().nullable().optional(),
  company_name: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  service_needed: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  score: z.number().min(0).max(100).default(0),
  approved: z.boolean().default(false),
  status: z.enum(['new', 'contacted', 'qualified', 'quote_sent', 'negotiation', 'won', 'lost']),
});

type LeadFormData = z.input<typeof leadSchema>;

interface LeadFormProps {
  lead?: Lead;
  onSubmit: (data: LeadFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function LeadForm({ lead, onSubmit, onCancel, isLoading }: LeadFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: lead || {
      status: 'new',
      score: 0,
      approved: false,
    },
  });

  const status = watch('status');
  const approved = watch('approved');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Name */}
        <div className="space-y-2">
          <Label htmlFor="contact_name">Contact Name *</Label>
          <Input
            id="contact_name"
            {...register('contact_name')}
            disabled={isLoading}
          />
          {errors.contact_name && (
            <p className="text-sm text-red-500">{errors.contact_name.message}</p>
          )}
        </div>

        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            {...register('company_name')}
            disabled={isLoading}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            disabled={isLoading}
          />
        </div>

        {/* Source */}
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            placeholder="e.g. Website, Referral, LinkedIn"
            {...register('source')}
            disabled={isLoading}
          />
        </div>

        {/* Service Needed */}
        <div className="space-y-2">
          <Label htmlFor="service_needed">Service Needed</Label>
          <Input
            id="service_needed"
            placeholder="e.g. Customs Clearance, Freight Forwarding"
            {...register('service_needed')}
            disabled={isLoading}
          />
        </div>

        {/* Score */}
        <div className="space-y-2">
          <Label htmlFor="score">Lead Score (0-100)</Label>
          <Input
            id="score"
            type="number"
            min="0"
            max="100"
            {...register('score', { valueAsNumber: true })}
            disabled={isLoading}
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setValue('status', value as LeadStatus)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="quote_sent">Quote Sent</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Approval Toggle */}
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-1">
              <Label htmlFor="approved" className="text-base">Lead approved</Label>
              <p className="text-sm text-muted-foreground">
                Toggle this when the lead has been approved for follow-up or conversion.
              </p>
            </div>
            <Switch
              id="approved"
              checked={Boolean(approved)}
              onCheckedChange={(checked) => setValue('approved', checked, { shouldDirty: true })}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            disabled={isLoading}
            rows={3}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : lead ? 'Update Lead' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
}
