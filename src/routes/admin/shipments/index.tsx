import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useShipments, useCreateShipment, useDeleteShipment } from '@/lib/hooks/useShipments';
import { ShipmentForm } from '@/components/admin/shipments/ShipmentForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MoreVertical, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/shipments/')({
  component: ShipmentsPage,
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

function ShipmentsPage() {
  const { data: shipments, isLoading } = useShipments();
  const createShipment = useCreateShipment();
  const deleteShipment = useDeleteShipment();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateShipment = async (data: any) => {
    try {
      await createShipment.mutateAsync(data);
      toast.success('Shipment created successfully');
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create shipment');
    }
  };

  const handleDeleteShipment = async (id: string, shipmentNumber: string) => {
    if (confirm(`Are you sure you want to delete shipment ${shipmentNumber}?`)) {
      try {
        await deleteShipment.mutateAsync(id);
        toast.success('Shipment deleted successfully');
      } catch (error) {
        toast.error('Failed to delete shipment');
      }
    }
  };

  const filteredShipments = shipments?.filter((shipment) =>
    shipment.shipment_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.origin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (shipment.customer?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <ProtectedRoute requiredRole={['super_admin', 'manager', 'logistics_officer']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shipments</h1>
              <p className="text-gray-600 mt-1">Track and manage all shipments</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Shipment
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search shipments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Current Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading shipments...
                    </TableCell>
                  </TableRow>
                ) : filteredShipments && filteredShipments.length > 0 ? (
                  filteredShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">
                        {shipment.shipment_number}
                      </TableCell>
                      <TableCell>
                        {shipment.customer?.company_name || '-'}
                      </TableCell>
                      <TableCell>
                        {shipment.origin} → {shipment.destination}
                      </TableCell>
                      <TableCell>
                        {shipment.current_location || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[shipment.status]}>
                          {shipment.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {shipment.eta
                          ? new Date(shipment.eta).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to="/admin/shipments/$id" params={{ id: shipment.id }}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteShipment(shipment.id, shipment.shipment_number)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {searchQuery ? 'No shipments found' : 'No shipments yet. Create your first shipment!'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-[96vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Shipment</DialogTitle>
            </DialogHeader>
            <ShipmentForm
              onSubmit={handleCreateShipment}
              onCancel={() => setIsCreateDialogOpen(false)}
              isLoading={createShipment.isPending}
            />
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </ProtectedRoute>
  );
}
