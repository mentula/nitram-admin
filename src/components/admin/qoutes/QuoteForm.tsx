import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCustomers } from '@/lib/hooks/useCustomers';
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
import type { Database } from '@/lib/database.types';

type Quote = Database['public']['Tables']['quotes']['Row'];
type QuoteStatus = Database['public']['Enums']['quote_status'];

const quoteSchema = z.object({
  customer_id: z.string().uuid().nullable().optional(),
  service_type: z.string().min(1, 'Service type is required'),
  origin: z.string().nullable().optional(),
  destination: z.string().nullable().optional(),
  cargo_description: z.string().nullable().optional(),
  cargo_weight: z.number().nullable().optional(),
  cargo_volume: z.number().nullable().optional(),
  estimated_cost: z.number().min(0, 'Cost must be positive').nullable().optional(),
  currency: z.string().default('ZMW'),
  valid_until: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(['draft', 'submitted', 'review', 'approved', 'rejected', 'converted']),
  approved: z.boolean().optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface QuoteFormProps {
  quote?: Quote;
  onSubmit: (data: QuoteFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function QuoteForm({ quote, onSubmit, onCancel, isLoading }: QuoteFormProps) {
  const { data: customers } = useCustomers();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema) as any,
    defaultValues: quote || {
      currency: 'ZMW',
      status: 'draft',
      customer_id: undefined,
      service_type: '',
      origin: undefined,
      destination: undefined,
      cargo_description: undefined,
      cargo_weight: undefined,
      cargo_volume: undefined,
      estimated_cost: undefined,
      valid_until: undefined,
      notes: undefined,
    },
  });

  const customerId = watch('customer_id') ?? undefined;
  const status = watch('status') ?? 'draft';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="customer_id">Customer *</Label>
          <Select
            value={customerId}
            onValueChange={(value) => setValue('customer_id', value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              {customers?.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.company_name} - {customer.contact_person}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.customer_id && (
            <p className="text-sm text-red-500">{errors.customer_id.message}</p>
          )}
        </div>

        {/* Service Type */}
        <div className="space-y-2">
          <Label htmlFor="service_type">Service Type *</Label>
          <Select
            value={watch('service_type') ?? ''}
            onValueChange={(value) => setValue('service_type', value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Customs Clearance">Customs Clearance</SelectItem>
              <SelectItem value="Freight Forwarding">Freight Forwarding</SelectItem>
              <SelectItem value="Transit Guarantee">Transit Guarantee</SelectItem>
              <SelectItem value="Cargo Consolidation">Cargo Consolidation</SelectItem>
              <SelectItem value="Export Management">Export Management</SelectItem>
              <SelectItem value="Full Service Package">Full Service Package</SelectItem>
            </SelectContent>
          </Select>
          {errors.service_type && (
            <p className="text-sm text-red-500">{errors.service_type.message}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setValue('status', value as QuoteStatus)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Origin */}
        <div className="space-y-2">
          <Label htmlFor="origin">Origin</Label>
          <Input
            id="origin"
            placeholder="e.g., Shanghai, China"
            {...register('origin')}
            disabled={isLoading}
          />
        </div>

        {/* Destination */}
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <Input
            id="destination"
            placeholder="e.g., Lusaka, Zambia"
            {...register('destination')}
            disabled={isLoading}
          />
        </div>

        {/* Cargo Weight */}
        <div className="space-y-2">
          <Label htmlFor="cargo_weight">Cargo Weight (kg)</Label>
          <Input
            id="cargo_weight"
            type="number"
            step="0.01"
            {...register('cargo_weight', { valueAsNumber: true })}
            disabled={isLoading}
          />
        </div>

        {/* Cargo Volume */}
        <div className="space-y-2">
          <Label htmlFor="cargo_volume">Cargo Volume (m³)</Label>
          <Input
            id="cargo_volume"
            type="number"
            step="0.01"
            {...register('cargo_volume', { valueAsNumber: true })}
            disabled={isLoading}
          />
        </div>

        {/* Estimated Cost */}
        <div className="space-y-2">
          <Label htmlFor="estimated_cost">Estimated Cost</Label>
          <Input
            id="estimated_cost"
            type="number"
            step="0.01"
            {...register('estimated_cost', { valueAsNumber: true })}
            disabled={isLoading}
          />
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={watch('currency') ?? 'ZMW'}
            onValueChange={(value) => setValue('currency', value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ZMW">ZMW (Zambian Kwacha)</SelectItem>
              <SelectItem value="USD">USD (US Dollar)</SelectItem>
              <SelectItem value="EUR">EUR (Euro)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Valid Until */}
        <div className="space-y-2">
          <Label htmlFor="valid_until">Valid Until</Label>
          <Input
            id="valid_until"
            type="date"
            {...register('valid_until')}
            disabled={isLoading}
          />
        </div>

        {/* Cargo Description */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="cargo_description">Cargo Description</Label>
          <Textarea
            id="cargo_description"
            placeholder="Describe the cargo/shipment details..."
            {...register('cargo_description')}
            disabled={isLoading}
            rows={3}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Internal Notes</Label>
          <Textarea
            id="notes"
            placeholder="Add any internal notes..."
            {...register('notes')}
            disabled={isLoading}
            rows={3}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : quote ? 'Update Quote' : 'Create Quote'}
        </Button>
      </div>
    </form>
  );
}
