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

type Shipment = Database['public']['Tables']['shipments']['Row'];
type ShipmentStatus = Database['public']['Enums']['shipment_status'];

const shipmentSchema = z.object({
  customer_id: z.string().uuid('Select a customer'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  current_location: z.string().nullable().optional(),
  cargo_description: z.string().nullable().optional(),
  cargo_weight: z.number().nullable().optional(),
  status: z.enum(['awaiting_collection', 'collected', 'customs_clearance', 'border_processing', 'in_transit', 'delivered', 'cancelled']),
  eta: z.string().nullable().optional(),
  tracking_notes: z.string().nullable().optional(),
});

type ShipmentFormData = z.infer<typeof shipmentSchema>;

interface ShipmentFormProps {
  shipment?: Shipment;
  onSubmit: (data: ShipmentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ShipmentForm({ shipment, onSubmit, onCancel, isLoading }: ShipmentFormProps) {
  const { data: customers } = useCustomers();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShipmentFormData>({
    resolver: zodResolver(shipmentSchema) as any,
    defaultValues: shipment || {
      status: 'awaiting_collection',
      customer_id: '',
      origin: '',
      destination: '',
      current_location: undefined,
      cargo_description: undefined,
      cargo_weight: undefined,
      eta: undefined,
      tracking_notes: undefined,
    },
  });

  const customerId = watch('customer_id') || undefined;
  const status = watch('status') ?? 'awaiting_collection';

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

        {/* Origin */}
        <div className="space-y-2">
          <Label htmlFor="origin">Origin *</Label>
          <Input
            id="origin"
            placeholder="e.g., Shanghai, China"
            {...register('origin')}
            disabled={isLoading}
          />
          {errors.origin && (
            <p className="text-sm text-red-500">{errors.origin.message}</p>
          )}
        </div>

        {/* Destination */}
        <div className="space-y-2">
          <Label htmlFor="destination">Destination *</Label>
          <Input
            id="destination"
            placeholder="e.g., Lusaka, Zambia"
            {...register('destination')}
            disabled={isLoading}
          />
          {errors.destination && (
            <p className="text-sm text-red-500">{errors.destination.message}</p>
          )}
        </div>

        {/* Current Location */}
        <div className="space-y-2">
          <Label htmlFor="current_location">Current Location</Label>
          <Input
            id="current_location"
            {...register('current_location')}
            disabled={isLoading}
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setValue('status', value as ShipmentStatus)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="awaiting_collection">Awaiting Collection</SelectItem>
              <SelectItem value="collected">Collected</SelectItem>
              <SelectItem value="customs_clearance">Customs Clearance</SelectItem>
              <SelectItem value="border_processing">Border Processing</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cargo Weight */}
        <div className="space-y-2">
          <Label htmlFor="cargo_weight">Cargo Weight (kg)</Label>
          <Input
            id="cargo_weight"
            type="number"
            step="0.01"
            {...register('cargo_weight', {
      setValueAs: (value) => value === '' ? null : Number(value),
    })}
            disabled={isLoading}
          />
        </div>

        {/* ETA */}
        <div className="space-y-2">
          <Label htmlFor="eta">Estimated Arrival</Label>
          <Input
            id="eta"
            type="date"
            {...register('eta')}
            disabled={isLoading}
          />
        </div>

        {/* Cargo Description */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="cargo_description">Cargo Description</Label>
          <Textarea
            id="cargo_description"
            placeholder="Describe the cargo..."
            {...register('cargo_description')}
            disabled={isLoading}
            rows={3}
          />
        </div>

        {/* Tracking Notes */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="tracking_notes">Tracking Notes</Label>
          <Textarea
            id="tracking_notes"
            placeholder="Add any tracking notes..."
            {...register('tracking_notes')}
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
          {isLoading ? 'Saving...' : shipment ? 'Update Shipment' : 'Create Shipment'}
        </Button>
      </div>
    </form>
  );
}
