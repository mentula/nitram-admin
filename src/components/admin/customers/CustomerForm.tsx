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
import type { Database } from '@/lib/database.types';

type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerStatus = Database['public']['Enums']['customer_status'];

const customerSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  contact_person: z.string().min(1, 'Contact person is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().nullable().optional(),
  country: z.string().default('Zambia'),
  city: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  postal_code: z.string().nullable().optional(),
  tax_id: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive', 'prospect']),
});

type CustomerFormData = z.input<typeof customerSchema>;

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CustomerForm({ customer, onSubmit, onCancel, isLoading }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer || {
      country: 'Zambia',
      status: 'prospect',
    },
  });

  const status = watch('status');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name *</Label>
          <Input
            id="company_name"
            {...register('company_name')}
            disabled={isLoading}
          />
          {errors.company_name && (
            <p className="text-sm text-red-500">{errors.company_name.message}</p>
          )}
        </div>

        {/* Contact Person */}
        <div className="space-y-2">
          <Label htmlFor="contact_person">Contact Person *</Label>
          <Input
            id="contact_person"
            {...register('contact_person')}
            disabled={isLoading}
          />
          {errors.contact_person && (
            <p className="text-sm text-red-500">{errors.contact_person.message}</p>
          )}
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

        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            {...register('country')}
            disabled={isLoading}
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            {...register('city')}
            disabled={isLoading}
          />
        </div>

        {/* Postal Code */}
        <div className="space-y-2">
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input
            id="postal_code"
            {...register('postal_code')}
            disabled={isLoading}
          />
        </div>

        {/* Tax ID */}
        <div className="space-y-2">
          <Label htmlFor="tax_id">Tax ID / TPIN</Label>
          <Input
            id="tax_id"
            {...register('tax_id')}
            disabled={isLoading}
          />
        </div>

        {/* Status */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setValue('status', value as CustomerStatus)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Address */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            {...register('address')}
            disabled={isLoading}
            rows={2}
          />
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
          {isLoading ? 'Saving...' : customer ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
}
