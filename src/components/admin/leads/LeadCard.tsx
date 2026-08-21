import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from '@tanstack/react-router';
import { Mail, Phone, Building, Calendar, GripVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Database } from '@/lib/database.types';

type Lead = Database['public']['Tables']['leads']['Row'];

interface LeadCardProps {
  lead: Lead;
  isDragging?: boolean;
}

export function LeadCard({ lead, isDragging }: LeadCardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <Link
            to="/admin/leads/$id"
            params={{ id: lead.id }}
            className="font-medium text-gray-900 hover:text-primary truncate block"
          >
            {lead.contact_name}
          </Link>
          {lead.company_name && (
            <p className="text-sm text-gray-600 truncate flex items-center mt-1">
              <Building className="h-3 w-3 mr-1" />
              {lead.company_name}
            </p>
          )}
        </div>
        {lead.score > 0 && (
          <span className="flex-shrink-0 ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
            {lead.score}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
          <span className="truncate">{lead.email}</span>
        </div>
        {lead.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
            <span className="truncate">{lead.phone}</span>
          </div>
        )}
        {lead.service_needed && (
          <p className="text-xs text-gray-500 truncate">{lead.service_needed}</p>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
        </div>
        {lead.source && (
          <span className="px-2 py-1 bg-gray-100 rounded">{lead.source}</span>
        )}
      </div>
    </div>
  );
}

export function LeadCardSortable({ lead }: { lead: Lead }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <LeadCard lead={lead} isDragging={isDragging} />
    </div>
  );
}
