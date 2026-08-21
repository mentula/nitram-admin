import { useState } from 'react';
import { isSupabaseConnected } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useLead, useUpdateLead, useConvertLeadToCustomer } from '@/lib/hooks/useLeads';
import { LeadForm } from '@/components/admin/leads/LeadForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Edit, Mail, Phone, Building, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/leads/$id')({
  component: LeadDetailPage,
});

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-purple-100 text-purple-800',
  qualified: 'bg-indigo-100 text-indigo-800',
  quote_sent: 'bg-yellow-100 text-yellow-800',
  negotiation: 'bg-orange-100 text-orange-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
};

function LeadDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: lead, isLoading } = useLead(id);
  const updateLead = useUpdateLead();
  const convertLead = useConvertLeadToCustomer();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);

  const handleApproveToggle = async (checked: boolean) => {
    console.debug('handleApproveToggle detail', id, checked, 'supabaseConnected=', isSupabaseConnected);
    if (!isSupabaseConnected) {
      toast.error('Cannot update approval: no Supabase connection from client');
      return;
    }
    const previousLead = queryClient.getQueryData(['lead', id]);
    const previousLeads = queryClient.getQueryData(['leads']);

    // optimistic update
    queryClient.setQueryData(['lead', id], (old: any) => (old ? { ...old, approved: checked } : old));
    queryClient.setQueryData(['leads'], (old: any) =>
      old?.map((l: any) => (l.id === id ? { ...l, approved: checked } : l)),
    );

    try {
      await updateLead.mutateAsync({ id, updates: { approved: checked } });
      
      // If approving, also convert to customer automatically (same workflow as quotes)
      if (checked && canConvert && !isConverted) {
        try {
          toast.info('Lead approved! Converting to customer...');
          const result = await convertLead.mutateAsync(id);
          toast.success(`Lead approved and converted to customer successfully`);
        } catch (convertError) {
          console.error('Auto-convert error (detail):', convertError);
          toast.success('Lead approved');
        }
      } else if (checked && isConverted) {
        toast.success('Lead approved (already converted to customer)');
      } else if (!checked) {
        toast.success('Lead approval removed');
      } else {
        toast.success('Lead approved');
      }
    } catch (error: any) {
      console.error('Approve toggle error (detail):', error);
      // rollback
      queryClient.setQueryData(['lead', id], previousLead);
      queryClient.setQueryData(['leads'], previousLeads);
      const errorMessage = error?.message || 'Failed to update approval status';
      toast.error(`Failed to update approval: ${errorMessage}`);
    }
  };

  const handleUpdateLead = async (data: any) => {
    try {
      await updateLead.mutateAsync({ id, updates: data });
      toast.success('Lead updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update lead');
    }
  };

  const handleConvertToCustomer = async () => {
    if (confirm('Convert this lead to a customer? This will create a new customer record.')) {
      try {
        const result = await convertLead.mutateAsync(id);
        toast.success('Lead converted to customer successfully');
        navigate({ to: `/admin/customers/${result.customer.id}` });
      } catch (error) {
        toast.error('Failed to convert lead');
      }
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

  if (!lead) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Lead not found</h2>
          <Button onClick={() => navigate({ to: '/admin/leads' })} className="mt-4">
            Back to Leads
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const canConvert = lead.status === 'qualified' || lead.status === 'quote_sent' || lead.status === 'negotiation';
  const isConverted = lead.status === 'won' && lead.converted_to_customer;

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
                onClick={() => navigate({ to: '/admin/leads' })}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{lead.contact_name}</h1>
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  <Badge className={statusColors[lead.status]}>
                    {lead.status.replace('_', ' ')}
                  </Badge>
                  {lead.score > 0 && (
                    <Badge variant="outline">Score: {lead.score}</Badge>
                  )}
                  <Badge variant={lead.approved ? 'default' : 'secondary'}>
                    {lead.approved ? 'Approved' : 'Not approved'}
                  </Badge>
                </div>
              </div>
            </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2">
                  <span className="text-sm font-medium text-gray-700">Approved</span>
                  <Switch
                    checked={Boolean(lead.approved)}
                    onCheckedChange={handleApproveToggle}
                    disabled={updateLead.isPending}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleConvertToCustomer}
                  disabled={!canConvert || convertLead.isPending}
                  title={!canConvert ? 'Lead must be qualified, quote sent, or in negotiation to convert' : ''}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Convert to Customer
                </Button>
                <Button onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel Edit' : 'Edit Lead'}
                </Button>
              </div>
          </div>

          {/* Converted Alert */}
          {isConverted && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                This lead has been converted to a customer.{' '}
                <a
                  href={`/admin/customers/${lead.converted_to_customer}`}
                  className="text-primary hover:underline"
                >
                  View customer profile
                </a>
              </AlertDescription>
            </Alert>
          )}

          {isEditing ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <LeadForm
                lead={lead}
                onSubmit={handleUpdateLead}
                onCancel={() => setIsEditing(false)}
                isLoading={updateLead.isPending}
              />
            </div>
          ) : (
            <>
              {/* Lead Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                    {lead.email}
                  </a>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-medium">Phone</span>
                  </div>
                  <p className="text-gray-900">{lead.phone || '-'}</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <Building className="h-4 w-4" />
                    <span className="text-sm font-medium">Company</span>
                  </div>
                  <p className="text-gray-900">{lead.company_name || '-'}</p>
                </div>
              </div>

              {/* Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Lead Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Source</p>
                    <p className="text-gray-900 mt-1">{lead.source || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Service Needed</p>
                    <p className="text-gray-900 mt-1">{lead.service_needed || '-'}</p>
                  </div>
                  {lead.notes && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-600">Notes</p>
                      <p className="text-gray-900 mt-1 whitespace-pre-wrap">{lead.notes}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-600">Created</p>
                    <p className="text-gray-900 mt-1">
                      {new Date(lead.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Updated</p>
                    <p className="text-gray-900 mt-1">
                      {new Date(lead.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
