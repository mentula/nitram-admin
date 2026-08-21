import { useState } from 'react';
import { isSupabaseConnected } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useLeads, useDeleteLead, useUpdateLead, useConvertLeadToCustomer } from '@/lib/hooks/useLeads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
import { Search, MoreVertical, Eye, Trash2, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/leads/')({
  component: LeadsPage,
});

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
  quote_sent: 'bg-purple-100 text-purple-800',
  negotiation: 'bg-orange-100 text-orange-800',
  won: 'bg-green-600 text-white',
  lost: 'bg-red-100 text-red-800',
};

function LeadsPage() {
  const { data: leads, isLoading } = useLeads();
  const deleteLead = useDeleteLead();
  const updateLead = useUpdateLead();
  const convertLead = useConvertLeadToCustomer();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteLead = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete lead "${name}"?`)) {
      try {
        await deleteLead.mutateAsync(id);
        toast.success('Lead deleted successfully');
      } catch (error) {
        toast.error('Failed to delete lead');
      }
    }
  };

const handleApproveToggle = async (id: string, checked: boolean, name: string) => {
    console.log('handleApproveToggle called:', id, checked, name);
    console.debug('handleApproveToggle', id, checked, name, 'supabaseConnected=', isSupabaseConnected);
    if (!isSupabaseConnected) {
      toast.error('Cannot update approval: no Supabase connection from client');
      return;
    }
    const previous = queryClient.getQueryData(['leads']);
    // optimistic update
    queryClient.setQueryData(['leads'], (old: any) =>
      old?.map((l: any) => (l.id === id ? { ...l, approved: checked } : l)),
    );

    try {
      await updateLead.mutateAsync({ id, updates: { approved: checked } });
      
      // If approving, also convert to customer automatically (any approved lead converts)
      if (checked) {
        try {
          const lead = leads?.find(l => l.id === id);
          console.log('✅ Lead found for conversion:', lead?.contact_name, 'status:', lead?.status);
          
          // Convert ANY approved lead (removed status restriction)
          if (lead && !lead.converted_to_customer) {
            toast.info('Lead approved! Creating customer...');
            const result = await convertLead.mutateAsync(id);
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success(`Lead approved and converted to customer: ${name}`);
          } else if (lead?.converted_to_customer) {
            toast.success(`Lead approved: ${name} (already converted to customer)`);
          } else {
            toast.success(`Lead approved: ${name}`);
          }
        } catch (convertError) {
          console.error('Auto-convert error:', convertError);
          toast.error(`Approval succeeded but conversion failed: ${(convertError as Error)?.message || 'Unknown error'}`);
        }
      } else {
        toast.success(`Lead approval removed: ${name}`);
      }
    } catch (error: any) {
      console.error('Approve toggle error:', error);
      // rollback
      queryClient.setQueryData(['leads'], previous);
      const errorMessage = error?.message || 'Failed to update approval status';
      toast.error(`Failed to update approval: ${errorMessage}`);
    }
  };

  const filteredLeads = leads?.filter((lead) =>
    lead.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lead.company_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (lead.service_needed?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <ProtectedRoute requiredRole={['super_admin', 'manager', 'sales_agent']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
              <p className="text-gray-600 mt-1">Manage incoming leads and opportunities</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{leads?.length || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">New</p>
              <p className="text-2xl font-bold text-blue-600">
                {leads?.filter(l => l.status === 'new').length || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Qualified</p>
              <p className="text-2xl font-bold text-green-600">
                {leads?.filter(l => l.status === 'qualified').length || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Won</p>
              <p className="text-2xl font-bold text-purple-600">
                {leads?.filter(l => l.status === 'won').length || 0}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search leads by name, email, company, or service..."
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
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Service Needed</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading leads...
                    </TableCell>
                  </TableRow>
                ) : filteredLeads && filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{lead.contact_name}</div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </span>
                            {lead.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {lead.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{lead.company_name || '-'}</TableCell>
                      <TableCell>{lead.service_needed || '-'}</TableCell>
                      <TableCell>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {lead.source || 'Unknown'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[lead.status]}>
                          {lead.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Switch
                            checked={Boolean(lead.approved)}
                            onCheckedChange={(checked) => handleApproveToggle(lead.id, checked, lead.contact_name)}
                            disabled={updateLead.isPending}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(lead.created_at).toLocaleDateString()}
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
                              <Link to="/admin/leads/$id" params={{ id: lead.id }}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteLead(lead.id, lead.contact_name)}
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
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {searchQuery ? 'No leads found' : 'No leads yet. Leads will appear here when customers submit assessment forms.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
