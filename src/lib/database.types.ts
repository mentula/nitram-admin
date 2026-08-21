export type Json = any;

export type UserRole = 'super_admin' | 'manager' | 'sales_agent' | 'logistics_officer' | 'content_manager' | 'customer';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'quote_sent' | 'negotiation' | 'won' | 'lost';
export type QuoteStatus = 'draft' | 'submitted' | 'review' | 'approved' | 'rejected' | 'converted';
export type ShipmentStatus = 'awaiting_collection' | 'collected' | 'customs_clearance' | 'border_processing' | 'in_transit' | 'delivered' | 'cancelled';
export type CustomerStatus = 'active' | 'inactive' | 'prospect';
export type TrackingStatus = 'active' | 'completed' | 'cancelled';

export type Database = any;
