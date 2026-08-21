import { useCustomerTimeline } from '@/lib/hooks/useCustomers';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Package, FileBox, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CustomerTimelineProps {
  customerId: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  in_transit: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
};

export function CustomerTimeline({ customerId }: CustomerTimelineProps) {
  const { data: timeline, isLoading } = useCustomerTimeline(customerId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-start space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {timeline.map((event, index) => {
        let icon, title, subtitle, link;

        switch (event.type) {
          case 'quote':
            icon = <FileText className="h-5 w-5 text-blue-600" />;
            title = `Quote ${event.data.quote_number}`;
            subtitle = `${event.data.service_type} - ZMW ${event.data.estimated_cost?.toLocaleString() || 'N/A'}`;
            link = `/admin/quotes/${event.data.id}`;
            break;
          case 'shipment':
            icon = <Package className="h-5 w-5 text-purple-600" />;
            title = `Shipment ${event.data.shipment_number}`;
            subtitle = `${event.data.origin} → ${event.data.destination}`;
            link = `/admin/shipments/${event.data.id}`;
            break;
          case 'document':
            icon = <FileBox className="h-5 w-5 text-gray-600" />;
            title = event.data.name;
            subtitle = event.data.file_type;
            break;
        }

        const statusBadge = event.data.status ? (
          <Badge className={statusColors[event.data.status] || 'bg-gray-100 text-gray-800'}>
            {event.data.status.replace('_', ' ')}
          </Badge>
        ) : null;

        return (
          <div key={`${event.type}-${event.data.id}`} className="flex items-start space-x-3">
            <div className="flex-shrink-0 p-2 bg-gray-100 rounded-full">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900">{title}</p>
                  {statusBadge}
                  {link && (
                    <a href={link} className="text-primary hover:underline">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            </div>
            {index < timeline.length - 1 && (
              <div className="absolute left-7 top-12 h-full w-0.5 bg-gray-200" />
            )}
          </div>
        );
      })}
    </div>
  );
}
