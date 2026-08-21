import { supabase } from './supabase';

export interface ActivityLogEntry {
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, any>;
}

export async function logActivity(entry: ActivityLogEntry) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    await supabase.from('activity_log').insert({
      user_id: user.id,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      details: entry.details,
      ip_address: null, // Can be enhanced with IP detection
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// Predefined activity types
export const ActivityTypes = {
  // Auth
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  
  // Customers
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
  CUSTOMER_DELETED: 'customer.deleted',
  CUSTOMER_VIEWED: 'customer.viewed',
  
  // Leads
  LEAD_CREATED: 'lead.created',
  LEAD_UPDATED: 'lead.updated',
  LEAD_CONVERTED: 'lead.converted',
  LEAD_DELETED: 'lead.deleted',
  
  // Quotes
  QUOTE_CREATED: 'quote.created',
  QUOTE_UPDATED: 'quote.updated',
  QUOTE_SENT: 'quote.sent',
  QUOTE_APPROVED: 'quote.approved',
  QUOTE_REJECTED: 'quote.rejected',
  QUOTE_CONVERTED: 'quote.converted',
  
  // Shipments
  SHIPMENT_CREATED: 'shipment.created',
  SHIPMENT_UPDATED: 'shipment.updated',
  SHIPMENT_STATUS_CHANGED: 'shipment.status_changed',
  SHIPMENT_DELETED: 'shipment.deleted',
  SHIPMENT_DELIVERED: 'shipment.delivered',
  
  // Documents
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_DOWNLOADED: 'document.downloaded',
  DOCUMENT_DELETED: 'document.deleted',
  
  // Blog
  BLOG_POST_CREATED: 'blog_post.created',
  BLOG_POST_UPDATED: 'blog_post.updated',
  BLOG_POST_PUBLISHED: 'blog_post.published',
  BLOG_POST_DELETED: 'blog_post.deleted',
  
  // Settings
  SETTINGS_UPDATED: 'settings.updated',
};
