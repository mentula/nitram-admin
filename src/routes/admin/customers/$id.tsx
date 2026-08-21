import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useCustomer, useUpdateCustomer } from '@/lib/hooks/useCustomers';
import { CustomerForm } from '@/components/admin/customers/CustomerForm';
import { CustomerTimeline } from '@/components/admin/customers/CustomerTimeline';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/customers/$id')({
  component: CustomerDetailPage,
});

function CustomerDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: customer, isLoading } = useCustomer(id);
  const updateCustomer = useUpdateCustomer();
  
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateCustomer = async (data: any) => {
    try {
      await updateCustomer.mutateAsync({ id, updates: data });
      toast.success('Customer updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update customer');
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

  if (!customer) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Customer not found</h2>
          <Button onClick={() => navigate({ to: '/admin/customers' })} className="mt-4">
            Back to Customers
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    prospect: 'bg-blue-100 text-blue-800',
  };

  return (
    <ProtectedRoute requiredRole={['super_admin', 'manager', 'sales_agent']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/admin/customers' })}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{customer.company_name}</h1>
                <Badge className={`${statusColors[customer.status]} mt-2`}>
                  {customer.status}
                </Badge>
              </div>
            </div>
            <Button onClick={() => setIsEditing(!isEditing)}>
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel Edit' : 'Edit Customer'}
            </Button>
          </div>

          {isEditing ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <CustomerForm
                customer={customer}
                onSubmit={handleUpdateCustomer}
                onCancel={() => setIsEditing(false)}
                isLoading={updateCustomer.isPending}
              />
            </div>
          ) : (
            <>
              {/* Customer Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
                    {customer.email}
                  </a>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-medium">Phone</span>
                  </div>
                  <p className="text-gray-900">{customer.phone || '-'}</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <p className="text-gray-900">
                    {customer.city ? `${customer.city}, ` : ''}{customer.country}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Company Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Contact Person</p>
                        <p className="text-gray-900 mt-1">{customer.contact_person}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Tax ID / TPIN</p>
                        <p className="text-gray-900 mt-1">{customer.tax_id || '-'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-600">Address</p>
                        <p className="text-gray-900 mt-1">{customer.address || '-'}</p>
                      </div>
                      {customer.notes && (
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-gray-600">Notes</p>
                          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{customer.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timeline">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
                    <CustomerTimeline customerId={id} />
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
