import { useShipmentTimeline, useAddTimelineEntry } from '@/lib/hooks/useShipments';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Calendar, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useState } from 'react';
import { toast } from 'sonner';
import type { Database } from '@/lib/database.types';

type ShipmentStatus = Database['public']['Enums']['shipment_status'];

interface ShipmentTimelineProps {
  shipmentId: string;
}

const statusLabels: Record<ShipmentStatus, string> = {
  awaiting_collection: 'Awaiting Collection',
  collected: 'Collected',
  customs_clearance: 'Customs Clearance',
  border_processing: 'Border Processing',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const statusColors: Record<ShipmentStatus, string> = {
  awaiting_collection: 'bg-gray-100 text-gray-800',
  collected: 'bg-blue-100 text-blue-800',
  customs_clearance: 'bg-yellow-100 text-yellow-800',
  border_processing: 'bg-orange-100 text-orange-800',
  in_transit: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function ShipmentTimeline({ shipmentId }: ShipmentTimelineProps) {
  const { data: timeline, isLoading } = useShipmentTimeline(shipmentId);
  const addEntry = useAddTimelineEntry();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    status: '' as ShipmentStatus,
    location: '',
    notes: '',
  });

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEntry.mutateAsync({
        shipment_id: shipmentId,
        status: formData.status,
        location: formData.location || null,
        notes: formData.notes || null,
      });
      toast.success('Timeline entry added');
      setIsDialogOpen(false);
      setFormData({ status: '' as ShipmentStatus, location: '', notes: '' });
    } catch (error) {
      toast.error('Failed to add timeline entry');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-start space-x-4">
            <div className="w-3 h-3 bg-gray-200 rounded-full mt-1" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Shipment Timeline</h3>
        <Button size="sm" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Update
        </Button>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-2 top-3 bottom-3 w-0.5 bg-gray-200" />

        {/* Timeline entries */}
        <div className="space-y-6">
          {timeline && timeline.length > 0 ? (
            timeline.map((entry, index) => (
              <div key={entry.id} className="relative flex items-start space-x-4">
                {/* Status dot */}
                <div
                  className={`relative z-10 w-4 h-4 rounded-full border-2 border-white ${
                    index === 0 ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />

                {/* Content */}
                <div className="flex-1 min-w-0 bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            statusColors[entry.status]
                          }`}
                        >
                          {statusLabels[entry.status]}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-1 text-xs font-medium bg-primary text-white rounded">
                            Current
                          </span>
                        )}
                      </div>

                      {entry.location && (
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {entry.location}
                        </div>
                      )}

                      {entry.notes && (
                        <p className="text-sm text-gray-700 mt-2">{entry.notes}</p>
                      )}

                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                        </div>
                        {entry.created_by_profile && (
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {entry.created_by_profile.full_name || entry.created_by_profile.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No timeline entries yet</p>
          )}
        </div>
      </div>

      {/* Add Entry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Timeline Update</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEntry} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as ShipmentStatus })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Lusaka, Zambia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional details..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addEntry.isPending || !formData.status}>
                {addEntry.isPending ? 'Adding...' : 'Add Update'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
