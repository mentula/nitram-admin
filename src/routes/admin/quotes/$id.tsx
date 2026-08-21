import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useQuote, useUpdateQuote, useApproveQuote, useConvertQuoteToShipment } from '@/lib/hooks/useQuotes';
import { QuoteForm } from '@/components/admin/quotes/QuoteForm';
import { downloadQuotePDF } from '@/lib/pdf-generator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Edit,
  Download,
  Mail,
  CheckCircle,
  Package,
  FileText,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/quotes/$id')({
  component: QuoteDetailPage,
});

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  converted: 'bg-purple-100 text-purple-800',
};

function QuoteDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: quote, isLoading } = useQuote(id);
  const updateQuote = useUpdateQuote();
  const approveQuote = useApproveQuote();
  const convertQuote = useConvertQuoteToShipment();
  
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateQuote = async (data: any) => {
    try {
      await updateQuote.mutateAsync({ id, updates: data });
      toast.success('Quote updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update quote');
    }
  };

  const handleDownloadPDF = () => {
    if (quote) {
      downloadQuotePDF(quote);
      toast.success('Quote PDF downloaded');
    }
  };

  const handleApprove = async () => {
    if (confirm('Approve this quote? This will mark it as approved.')) {
      try {
        await approveQuote.mutateAsync(id);
        toast.success('Quote approved successfully');
      } catch (error) {
        toast.error('Failed to approve quote');
      }
    }
  };

  const handleConvertToShipment = async () => {
    if (confirm('Convert this quote to a shipment? This will create a new shipment record.')) {
      try {
        const result = await convertQuote.mutateAsync(id);
        toast.success('Quote converted to shipment successfully');
        navigate({ to: `/admin/shipments/${result.shipment.id}` });
      } catch (error) {
        toast.error('Failed to convert quote');
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

  if (!quote) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Quote not found</h2>
          <Button onClick={() => navigate({ to: '/admin/quotes' })} className="mt-4">
            Back to Quotes
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const canApprove = quote.status === 'submitted' || quote.status === 'review';
  const canConvert = quote.status === 'approved';

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
                onClick={() => navigate({ to: '/admin/quotes' })}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quote {quote.quote_number}</h1>
                <Badge className={`${statusColors[quote.status]} mt-2`}>
                  {quote.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              {canApprove && (
                <Button variant="outline" onClick={handleApprove} disabled={approveQuote.isPending}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Quote
                </Button>
              )}
              {canConvert && (
                <Button variant="outline" onClick={handleConvertToShipment} disabled={convertQuote.isPending}>
                  <Package className="h-4 w-4 mr-2" />
                  Convert to Shipment
                </Button>
              )}
              <Button onClick={() => setIsEditing(!isEditing)}>
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel Edit' : 'Edit Quote'}
              </Button>
            </div>
          </div>

          {/* Converted Alert */}
          {quote.status === 'converted' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                This quote has been converted to a shipment.
              </AlertDescription>
            </Alert>
          )}

          {isEditing ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <QuoteForm
                quote={quote}
                onSubmit={handleUpdateQuote}
                onCancel={() => setIsEditing(false)}
                isLoading={updateQuote.isPending}
              />
            </div>
          ) : (
            <>
              {/* Customer Info */}
              {quote.customer && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Company</p>
                      <p className="text-gray-900 mt-1">{quote.customer.company_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Contact Person</p>
                      <p className="text-gray-900 mt-1">{quote.customer.contact_person}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <a href={`mailto:${quote.customer.email}`} className="text-primary hover:underline">
                        {quote.customer.email}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone</p>
                      <p className="text-gray-900 mt-1">{quote.customer.phone || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quote Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">Service</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{quote.service_type}</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">Estimated Cost</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {quote.estimated_cost
                      ? `${quote.currency} ${quote.estimated_cost.toLocaleString()}`
                      : 'TBD'}
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Created</span>
                  </div>
                  <p className="text-gray-900">
                    {new Date(quote.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Valid Until</span>
                  </div>
                  <p className="text-gray-900">
                    {quote.valid_until
                      ? new Date(quote.valid_until).toLocaleDateString()
                      : '-'}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Shipment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Origin</p>
                    <p className="text-gray-900 mt-1">{quote.origin || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Destination</p>
                    <p className="text-gray-900 mt-1">{quote.destination || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cargo Weight</p>
                    <p className="text-gray-900 mt-1">
                      {quote.cargo_weight ? `${quote.cargo_weight} kg` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cargo Volume</p>
                    <p className="text-gray-900 mt-1">
                      {quote.cargo_volume ? `${quote.cargo_volume} m³` : '-'}
                    </p>
                  </div>
                  {quote.cargo_description && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-600">Cargo Description</p>
                      <p className="text-gray-900 mt-1 whitespace-pre-wrap">{quote.cargo_description}</p>
                    </div>
                  )}
                  {quote.notes && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-600">Internal Notes</p>
                      <p className="text-gray-900 mt-1 whitespace-pre-wrap">{quote.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
