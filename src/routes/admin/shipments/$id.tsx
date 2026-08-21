import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useShipment, useUpdateShipment } from '@/lib/hooks/useShipments';
import { ShipmentForm } from '@/components/admin/shipments/ShipmentForm';
import { ShipmentTimeline } from '@/components/admin/shipments/ShipmentTimeline';
import { TrackingManagement } from '@/components/admin/shipments/TrackingManagement';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  MapPin,
  Navigation,
  Calendar,
  Package as PackageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/shipments/$id')({
  component: ShipmentDetailPage,
});

const statusColors: Record<string, string> = {
  awaiting_collection: 'bg-gray-100 text-gray-800',
  collected: 'bg-blue-100 text-blue-800',
  customs_clearance: 'bg-yellow-100 text-yellow-800',
  border_processing: 'bg-orange-100 text-orange-800',
  in_transit: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function ShipmentDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: shipment, isLoading } = useShipment(id);
  const updateShipment = useUpdateShipment();
  
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateShipment = async (data: any) => {
    try {
      await updateShipment.mutateAsync({ id, updates: data });
      toast.success('Shipment updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update shipment');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!shipment) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Shipment not found</h2>
          <Button onClick={() => navigate({ to: '/admin/shipments' })} className="mt-4">
            Back to Shipments
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <ProtectedRoute requiredRole={['super_admin', 'manager', 'logistics_officer']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/admin/shipments' })}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Shipment {shipment.shipment_number}
                </h1>
                <Badge className={`${statusColors[shipment.status]} mt-2`}>
                  {shipment.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <Button onClick={() => setIsEditing(!isEditing)}>
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel Edit' : 'Edit Shipment'}
            </Button>
          </div>

          {isEditing ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <ShipmentForm
                shipment={shipment}
                onSubmit={handleUpdateShipment}
                onCancel={() => setIsEditing(false)}
                isLoading={updateShipment.isPending}
              />
            </div>
          ) : (
            <>
              {/* Customer Info */}
              {shipment.customer && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Company</p>
                      <p className="text-gray-900 mt-1">{shipment.customer.company_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Contact Person</p>
                      <p className="text-gray-900 mt-1">{shipment.customer.contact_person}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <a href={`mailto:${shipment.customer.email}`} className="text-primary hover:underline">
                        {shipment.customer.email}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone</p>
                      <p className="text-gray-900 mt-1">{shipment.customer.phone || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipment Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <Navigation className="h-4 w-4" />
                    <span className="text-sm font-medium">Origin</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{shipment.origin}</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Destination</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{shipment.destination}</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Current Location</span>
                  </div>
                  <p className="text-gray-900">{shipment.current_location || 'Not updated'}</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">ETA</span>
                  </div>
                  <p className="text-gray-900">
                    {shipment.eta
                      ? new Date(shipment.eta).toLocaleDateString()
                      : 'Not set'}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="timeline" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="tracking">Tracking</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="timeline">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <ShipmentTimeline shipmentId={id} />
                  </div>
                </TabsContent>

                <TabsContent value="tracking">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Client Tracking</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Manage the public tracking information for this shipment. 
                      Clients can use the tracking token to see real-time progress.
                    </p>
                    <TrackingManagement shipmentId={id} />
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Shipment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Cargo Weight</p>
                        <p className="text-gray-900 mt-1">
                          {shipment.cargo_weight ? `${shipment.cargo_weight} kg` : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Created</p>
                        <p className="text-gray-900 mt-1">
                          {new Date(shipment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {shipment.cargo_description && (
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-gray-600">Cargo Description</p>
                          <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                            {shipment.cargo_description}
                          </p>
                        </div>
                      )}
                      {shipment.tracking_notes && (
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-gray-600">Tracking Notes</p>
                          <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                            {shipment.tracking_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Documents</h3>
                    <p className="text-gray-500 text-center py-8">Document management coming soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
