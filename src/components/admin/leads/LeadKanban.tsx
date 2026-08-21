import { useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { useLeads, useUpdateLeadStatus } from '@/lib/hooks/useLeads';
import { LeadCard, LeadCardSortable } from './LeadCard';
import type { Database } from '@/lib/database.types';

type Lead = Database['public']['Tables']['leads']['Row'];
type LeadStatus = Database['public']['Enums']['lead_status'];

const columns: { id: LeadStatus; title: string; color: string }[] = [
  { id: 'new', title: 'New Leads', color: 'bg-blue-100 border-blue-200' },
  { id: 'contacted', title: 'Contacted', color: 'bg-purple-100 border-purple-200' },
  { id: 'qualified', title: 'Qualified', color: 'bg-indigo-100 border-indigo-200' },
  { id: 'quote_sent', title: 'Quote Sent', color: 'bg-yellow-100 border-yellow-200' },
  { id: 'negotiation', title: 'Negotiation', color: 'bg-orange-100 border-orange-200' },
  { id: 'won', title: 'Won', color: 'bg-green-100 border-green-200' },
  { id: 'lost', title: 'Lost', color: 'bg-red-100 border-red-200' },
];

export function LeadKanban() {
  const { data: leads } = useLeads();
  const updateLeadStatus = useUpdateLeadStatus();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const groupedLeads = useMemo(() => {
    if (!leads) return {};
    
    return leads.reduce<Record<string, Lead[]>>((acc, lead) => {
      if (!acc[lead.status]) {
        acc[lead.status] = [];
      }
      acc[lead.status].push(lead);
      return acc;
    }, {});
  }, [leads]);

  const activeLead = useMemo(() => {
    if (!activeId || !leads) return null;
    return leads.find((lead) => lead.id === activeId);
  }, [activeId, leads]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const newStatus = over.id as LeadStatus;
      updateLeadStatus.mutate({
        id: active.id as string,
        status: newStatus,
      });
    }

    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnLeads = groupedLeads[column.id] || [];

          return (
            <div
              key={column.id}
              className={`flex-shrink-0 w-64 sm:w-80 rounded-lg border-2 ${column.color} p-4`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                  {columnLeads.length}
                </span>
              </div>

              <SortableContext
                items={columnLeads.map((lead) => lead.id)}
                strategy={verticalListSortingStrategy}
                id={column.id}
              >
                <div className="space-y-3 min-h-[150px] sm:min-h-[200px]">
                  {columnLeads.map((lead: Lead) => (
                    <LeadCardSortable key={lead.id} lead={lead} />
                  ))}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeLead ? <LeadCard lead={activeLead} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
