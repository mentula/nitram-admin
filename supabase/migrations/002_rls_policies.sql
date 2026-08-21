-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Check if user has specific role
CREATE OR REPLACE FUNCTION has_role(required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = required_role
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has any of the roles
CREATE OR REPLACE FUNCTION has_any_role(required_roles user_role[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = ANY(required_roles)
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins and managers can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    has_any_role(ARRAY['super_admin', 'manager']::user_role[])
  );

-- Only super admins can insert/delete profiles
CREATE POLICY "Super admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (has_role('super_admin'));

CREATE POLICY "Super admins can delete profiles" ON profiles
  FOR DELETE USING (has_role('super_admin'));

-- ============================================================================
-- CUSTOMERS POLICIES
-- ============================================================================

-- Staff can view all customers
CREATE POLICY "Staff can view customers" ON customers
  FOR SELECT USING (
    has_any_role(ARRAY['super_admin', 'manager', 'sales_agent', 'logistics_officer']::user_role[])
  );

-- Customers can view their own company
CREATE POLICY "Customers can view own company" ON customers
  FOR SELECT USING (
    has_role('customer') AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = customers.email
    )
  );

-- Staff can create/update customers
CREATE POLICY "Staff can insert customers" ON customers
  FOR INSERT WITH CHECK (
    has_any_role(ARRAY['super_admin', 'manager', 'sales_agent']::user_role[])
  );

CREATE POLICY "Staff can update customers" ON customers
  FOR UPDATE USING (
    has_any_role(ARRAY['super_admin', 'manager', 'sales_agent']::user_role[])
  );

-- Only admins can delete customers
CREATE POLICY "Admins can delete customers" ON customers
  FOR DELETE USING (
    has_any_role(ARRAY['super_admin', 'manager']::user_role[])
  );

-- ============================================================================
-- LEADS POLICIES
-- ============================================================================

-- Staff can view all leads
CREATE POLICY "Staff can view leads" ON leads
  FOR SELECT USING (
    has_any_role(ARRAY['super_admin', 'manager', 'sales_agent']::user_role[])
  );

-- Sales agents can create leads
CREATE POLICY "Sales agents can create leads" ON leads
  FOR INSERT WITH CHECK (
    has_any_role(ARRAY['super_admin', 'manager', 'sales_agent']::user_role[])
  );

-- Sales agents can update their assigned leads or if they are manager/admin
CREATE POLICY "Sales agents can update leads" ON leads
  FOR UPDATE USING (
    has_any_role(ARRAY['super_admin', 'manager']::user_role[]) OR
    (has_role('sales_agent') AND assigned_to = auth.uid())
  );

-- Only managers can delete leads
CREATE POLICY "Managers can delete leads" ON leads
  FOR DELETE USING (
    has_any_role(ARRAY['super_admin', 'manager']::user_role[])
  );

-- ============================================================================
-- QUOTES POLICIES
-- ============================================================================

-- Staff can view all quotes
CREATE POLICY "Staff can view quotes" ON quotes
  FOR SELECT USING (
    has_any_role(ARRAY['super_admin', 'manager', 'sales_agent', 'logistics_officer']::user_role[])
  );

-- Customers can view their own quotes
CREATE POLICY "Customers can view own quotes" ON quotes
  FOR SELECT USING (
    has_role('customer') AND
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = quotes.customer_id
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.email = customers.email
      )
    )
  );

-- Staff can create/update quotes
CREATE POLICY "Staff can create quotes" ON quotes
  FOR INSERT WITH CHECK (
    has_any_role(ARRAY['super_admin', 'manager', 'sales_agent']::user_role[])
  );

CREATE POLICY "Staff can update quotes" ON quotes
  FOR UPDATE USING (
    has_any_role(ARRAY['super_admin', 'manager', 'sales_agent']::user_role[])
  );

-- Only managers can delete quotes
CREATE POLICY "Managers can delete quotes" ON quotes
  FOR DELETE USING (
    has_any_role(ARRAY['super_admin', 'manager']::user_role[])
  );

-- ============================================================================
-- SHIPMENTS POLICIES
-- ============================================================================

-- Staff can view all shipments
CREATE POLICY "Staff can view shipments" ON shipments
  FOR SELECT USING (
    has_any_role(ARRAY['super_admin', 'manager', 'sales_agent', 'logistics_officer']::user_role[])
  );

-- Customers can view their own shipments
CREATE POLICY "Customers can view own shipments" ON shipments
  FOR SELECT USING (
    has_role('customer') AND
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = shipments.customer_id
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.email = customers.email
      )
    )
  );

-- Staff can create/update shipments
CREATE POLICY "Staff can create shipments" ON shipments
  FOR INSERT WITH CHECK (
    has_any_role(ARRAY['super_admin', 'manager', 'logistics_officer']::user_role[])
  );

CREATE POLICY "Staff can update shipments" ON shipments
  FOR UPDATE USING (
    has_any_role(ARRAY['super_admin', 'manager', 'logistics_officer']::user_role[])
  );

-- Only managers can delete shipments
CREATE POLICY "Managers can delete shipments" ON shipments
  FOR DELETE USING (
    has_any_role(ARRAY['super_admin', 'manager']::user_role[])
  );

-- ============================================================================
-- SHIPMENT TIMELINE POLICIES
-- ============================================================================

-- Staff and customers can view shipment timeline
CREATE POLICY "View shipment timeline" ON shipment_timeline
  FOR SELECT USING (
    has_any_role(ARRAY['super_admin', 'manager', 'sales_agent', 'logistics_officer']::user_role[]) OR
    (has_role('customer') AND
      EXISTS (
        SELECT 1 FROM shipments s
        JOIN customers c ON c.id = s.customer_id
        WHERE s.id = shipment_timeline.shipment_id
        AND EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.email = c.email
        )
      )
    )
  );

-- Staff can create timeline entries
CREATE POLICY "Staff can create timeline" ON shipment_timeline
  FOR INSERT WITH CHECK (
    has_any_role(ARRAY['super_admin', 'manager', 'logistics_officer']::user_role[])
  );

-- ============================================================================
-- DOCUMENTS POLICIES
-- ============================================================================

-- Staff can view all documents
CREATE POLICY "Staff can view documents" ON documents
  FOR SELECT USING (
    has_any_role(ARRAY['super_admin', 'manager', 'sales_agent', 'logistics_officer']::user_role[])
  );

-- Customers can view their own documents
CREATE POLICY "Customers can view own documents" ON documents
  FOR SELECT USING (
    has_role('customer') AND
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = documents.customer_id
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.email = customers.email
      )
    )
  );

-- Staff can upload documents
CREATE POLICY "Staff can upload documents" ON documents
  FOR INSERT WITH CHECK (
    has_any_role(ARRAY['super_admin', 'manager', 'sales_agent', 'logistics_officer']::user_role[])
  );

-- Only managers can delete documents
CREATE POLICY "Managers can delete documents" ON documents
  FOR DELETE USING (
    has_any_role(ARRAY['super_admin', 'manager']::user_role[])
  );

-- ============================================================================
-- BLOG POLICIES (Public Read, Staff Write)
-- ============================================================================

-- Anyone can view published blog posts
CREATE POLICY "Anyone can view published posts" ON blog_posts
  FOR SELECT USING (published = true);

-- Staff can view all posts including drafts
CREATE POLICY "Staff can view all posts" ON blog_posts
  FOR SELECT USING (
    has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[])
  );

-- Content managers can create/update posts
CREATE POLICY "Content managers can create posts" ON blog_posts
  FOR INSERT WITH CHECK (
    has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[])
  );

CREATE POLICY "Content managers can update posts" ON blog_posts
  FOR UPDATE USING (
    has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[])
  );

-- Only admins can delete posts
CREATE POLICY "Admins can delete posts" ON blog_posts
  FOR DELETE USING (
    has_any_role(ARRAY['super_admin', 'manager']::user_role[])
  );

-- Public read for categories, tags
CREATE POLICY "Anyone can view blog categories" ON blog_categories
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view blog tags" ON blog_tags
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view blog authors" ON blog_authors
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view post tags" ON blog_post_tags
  FOR SELECT USING (true);

-- Staff can manage blog metadata
CREATE POLICY "Staff can manage categories" ON blog_categories
  FOR ALL USING (
    has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[])
  );

CREATE POLICY "Staff can manage tags" ON blog_tags
  FOR ALL USING (
    has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[])
  );

CREATE POLICY "Staff can manage authors" ON blog_authors
  FOR ALL USING (
    has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[])
  );

CREATE POLICY "Staff can manage post tags" ON blog_post_tags
  FOR ALL USING (
    has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[])
  );

-- ============================================================================
-- FAQ POLICIES
-- ============================================================================

-- Anyone can view published FAQs
CREATE POLICY "Anyone can view published FAQs" ON faqs
  FOR SELECT USING (published = true);

-- Staff can view all FAQs
CREATE POLICY "Staff can view all FAQs" ON faqs
  FOR SELECT USING (
    has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[])
  );

-- Content managers can manage FAQs
CREATE POLICY "Content managers can manage FAQs" ON faqs
  FOR ALL USING (
    has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[])
  );

-- ============================================================================
-- ACTIVITY LOG POLICIES
-- ============================================================================

-- Users can view their own activity
CREATE POLICY "Users can view own activity" ON activity_log
  FOR SELECT USING (user_id = auth.uid());

-- Admins can view all activity
CREATE POLICY "Admins can view all activity" ON activity_log
  FOR SELECT USING (
    has_any_role(ARRAY['super_admin', 'manager']::user_role[])
  );

-- System can insert activity (authenticated users)
CREATE POLICY "Authenticated users can log activity" ON activity_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- SETTINGS POLICIES
-- ============================================================================

-- Staff can view settings
CREATE POLICY "Staff can view settings" ON settings
  FOR SELECT USING (
    has_any_role(ARRAY['super_admin', 'manager']::user_role[])
  );

-- Only super admins can manage settings
CREATE POLICY "Super admins can manage settings" ON settings
  FOR ALL USING (has_role('super_admin'));

-- ============================================================================
-- EMAIL CAMPAIGNS POLICIES
-- ============================================================================

-- Managers can view campaigns
CREATE POLICY "Managers can view campaigns" ON email_campaigns
  FOR SELECT USING (
    has_any_role(ARRAY['super_admin', 'manager']::user_role[])
  );

-- Managers can manage campaigns
CREATE POLICY "Managers can manage campaigns" ON email_campaigns
  FOR ALL USING (
    has_any_role(ARRAY['super_admin', 'manager']::user_role[])
  );

-- ============================================================================
-- BLOG MEDIA POLICIES
-- ============================================================================

-- Staff can view all media
CREATE POLICY "Staff can view media" ON blog_media
  FOR SELECT USING (
    has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[])
  );

-- Content managers can upload media
CREATE POLICY "Content managers can upload media" ON blog_media
  FOR INSERT WITH CHECK (
    has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[])
  );

-- Only admins can delete media
CREATE POLICY "Admins can delete media" ON blog_media
  FOR DELETE USING (
    has_any_role(ARRAY['super_admin', 'manager']::user_role[])
  );
