import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useQuotes, useCreateQuote, useApproveQuote, useDeleteQuote } from '@/lib/hooks/useQuotes';
import { QuoteForm } from '@/components/admin/quotes/QuoteForm';
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
import { Plus, Search, MoreVertical, Eye, Trash2, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/quotes/')({
  component: QuotesPage,
});

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  converted: 'bg-purple-100 text-purple-800',
};

function QuotesPage() {
  const { data: quotes, isLoading } = useQuotes();
  const createQuote = useCreateQuote();
  const approveQuote = useApproveQuote();
  const deleteQuote = useDeleteQuote();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateQuote = async (data: any) => {
    try {
      await createQuote.mutateAsync(data);
      toast.success('Quote created successfully');
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create quote');
    }
  };

  const handleDeleteQuote = async (id: string, quoteNumber: string) => {
    if (confirm(`Are you sure you want to delete quote ${quoteNumber}?`)) {
      try {
        await deleteQuote.mutateAsync(id);
        toast.success('Quote deleted successfully');
      } catch (error) {
        toast.error('Failed to delete quote');
      }
    }
  };

  const handleApproveQuote = async (id: string) => {
    if (confirm('Approve this quote?')) {
      try {
        await approveQuote.mutateAsync(id);
        toast.success('Quote approved successfully');
      } catch (error) {
        toast.error('Failed to approve quote');
      }
    }
  };
  const filteredQuotes = quotes?.filter((quote) =>
    quote.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quote.service_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (quote.customer?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (quote.requester_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (quote.requester_email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (quote.requester_company?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (quote.lead?.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <ProtectedRoute requiredRole={['super_admin', 'manager', 'sales_agent']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
              <p className="text-gray-600 mt-1">Manage service quotes and estimates</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Quote
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search quotes..."
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
                  <TableHead>Quote #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading quotes...
                    </TableCell>
                  </TableRow>
                ) : filteredQuotes && filteredQuotes.length > 0 ? (
                  filteredQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">
                        {quote.quote_number}
                      </TableCell>
                      <TableCell>
                        {quote.customer?.company_name || quote.requester_company || quote.requester_name || quote.lead?.contact_name || '-'}
                      </TableCell>
                      <TableCell>{quote.service_type}</TableCell>
                      <TableCell>
                        {quote.origin && quote.destination
                          ? `${quote.origin} → ${quote.destination}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {quote.estimated_cost
                          ? `${quote.currency} ${quote.estimated_cost.toLocaleString()}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[quote.status]}>
                          {quote.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(quote.created_at).toLocaleDateString()}
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
                              <Link to="/admin/quotes/$id" params={{ id: quote.id }}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  if (['submitted', 'review'].includes(quote.status)) {
                                    handleApproveQuote(quote.id);
                                  } else {
                                    toast.error(`Cannot approve quote with status: ${quote.status}. Only submitted or review quotes can be approved.`);
                                  }
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Quote
                              </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteQuote(quote.id, quote.quote_number)}
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
                      {searchQuery ? 'No quotes found' : 'No quotes yet. Create your first quote!'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-[96vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Quote</DialogTitle>
            </DialogHeader>
            <QuoteForm
              onSubmit={handleCreateQuote}
              onCancel={() => setIsCreateDialogOpen(false)}
              isLoading={createQuote.isPending}
            />
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </ProtectedRoute>
  );
}
