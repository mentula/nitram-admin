-- ============================================================================
-- NITRAM LOGISTICS - COMPLETE DATABASE SETUP
-- Run this entire script in Supabase SQL Editor: https://supabase.com/dashboard/project/ekuifrbgozeqxvzmbnse/editor
-- ============================================================================

-- ============================================================================
-- ENABLE EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'manager', 'sales_agent', 'logistics_officer', 'content_manager', 'customer');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'quote_sent', 'negotiation', 'won', 'lost');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE quote_status AS ENUM ('draft', 'submitted', 'review', 'approved', 'rejected', 'converted');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE shipment_status AS ENUM ('awaiting_collection', 'collected', 'customs_clearance', 'border_processing', 'in_transit', 'delivered', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE customer_status AS ENUM ('active', 'inactive', 'prospect');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  phone TEXT,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CUSTOMERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT DEFAULT 'Zambia',
  address TEXT,
  city TEXT,
  postal_code TEXT,
  tax_id TEXT,
  notes TEXT,
  status customer_status DEFAULT 'prospect',
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_assigned_to ON customers(assigned_to);

-- ============================================================================
-- LEADS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT,
  company_name TEXT,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_needed TEXT,
  notes TEXT,
  status lead_status DEFAULT 'new',
  score INTEGER DEFAULT 0,
  approved BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES profiles(id),
  converted_to_customer UUID REFERENCES customers(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);

-- ============================================================================
-- QUOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number TEXT NOT NULL UNIQUE,
  approved BOOLEAN DEFAULT false,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id),
  service_type TEXT NOT NULL,
  origin TEXT,
  destination TEXT,
  cargo_description TEXT,
  cargo_weight DECIMAL,
  cargo_volume DECIMAL,
  estimated_cost DECIMAL,
  currency TEXT DEFAULT 'ZMW',
  valid_until DATE,
  notes TEXT,
  status quote_status DEFAULT 'draft',
  created_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure approved column exists on quotes (in case the table was created before this update)
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_quotes_approved ON quotes(approved);

CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_number ON quotes(quote_number);

-- ============================================================================
-- SHIPMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  current_location TEXT,
  cargo_description TEXT,
  cargo_weight DECIMAL,
  status shipment_status DEFAULT 'awaiting_collection',
  eta DATE,
  actual_delivery_date DATE,
  tracking_notes TEXT,
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipments_customer ON shipments(customer_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_number ON shipments(shipment_number);

-- ============================================================================
-- SHIPMENT TIMELINE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS shipment_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  status shipment_status NOT NULL,
  location TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipment_timeline_shipment ON shipment_timeline(shipment_id);

-- ============================================================================
-- DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  bucket_name TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  category TEXT,
  description TEXT,
  expires_at DATE,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_customer ON documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_documents_shipment ON documents(shipment_id);
CREATE INDEX IF NOT EXISTS idx_documents_quote ON documents(quote_id);

-- ============================================================================
-- BLOG SYSTEM TABLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES blog_categories(id),
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  social_links JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  author_id UUID REFERENCES blog_authors(id),
  category_id UUID REFERENCES blog_categories(id),
  status TEXT DEFAULT 'draft',
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);

CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE IF NOT EXISTS blog_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  alt_text TEXT,
  caption TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FAQS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_published ON faqs(published);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);

-- ============================================================================
-- ACTIVITY LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

-- ============================================================================
-- EMAIL CAMPAIGNS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TRACKING TOKENS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tracking_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(8) UNIQUE NOT NULL,
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  current_step INTEGER NOT NULL DEFAULT 1 CHECK (current_step >= 1 AND current_step <= 8),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure customer_id column exists (for tables created before this update)
ALTER TABLE tracking_tokens ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tracking_tokens_token ON tracking_tokens(token);
CREATE INDEX IF NOT EXISTS idx_tracking_tokens_shipment_id ON tracking_tokens(shipment_id);
CREATE INDEX IF NOT EXISTS idx_tracking_tokens_customer_id ON tracking_tokens(customer_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shipments_updated_at ON shipments;
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- tracking_tokens updated_at trigger
CREATE OR REPLACE FUNCTION update_tracking_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tracking_tokens_updated_at ON tracking_tokens;
CREATE TRIGGER tracking_tokens_updated_at BEFORE UPDATE ON tracking_tokens FOR EACH ROW EXECUTE FUNCTION update_tracking_tokens_updated_at();

-- Auto-generate quote numbers
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_prefix TEXT;
  counter INTEGER;
BEGIN
  year_prefix := 'Q' || TO_CHAR(NOW(), 'YY');
  SELECT COUNT(*) + 1 INTO counter FROM quotes WHERE quote_number LIKE year_prefix || '%';
  new_number := year_prefix || LPAD(counter::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_quote_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
    NEW.quote_number := generate_quote_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_insert_quote_number ON quotes;
CREATE TRIGGER before_insert_quote_number BEFORE INSERT ON quotes FOR EACH ROW EXECUTE FUNCTION set_quote_number();

-- Auto-generate shipment numbers
CREATE OR REPLACE FUNCTION generate_shipment_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_prefix TEXT;
  counter INTEGER;
BEGIN
  year_prefix := 'S' || TO_CHAR(NOW(), 'YY');
  SELECT COUNT(*) + 1 INTO counter FROM shipments WHERE shipment_number LIKE year_prefix || '%';
  new_number := year_prefix || LPAD(counter::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_shipment_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.shipment_number IS NULL OR NEW.shipment_number = '' THEN
    NEW.shipment_number := generate_shipment_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_insert_shipment_number ON shipments;
CREATE TRIGGER before_insert_shipment_number BEFORE INSERT ON shipments FOR EACH ROW EXECUTE FUNCTION set_shipment_number();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
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
ALTER TABLE tracking_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS HELPER FUNCTIONS
-- ============================================================================
CREATE OR REPLACE FUNCTION has_role(required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = required_role AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_any_role(required_roles user_role[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ANY(required_roles) AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES - PROFILES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (has_any_role(ARRAY['super_admin', 'manager']::user_role[]));

DROP POLICY IF EXISTS "Super admins can insert profiles" ON profiles;
CREATE POLICY "Super admins can insert profiles" ON profiles FOR INSERT WITH CHECK (has_role('super_admin'));

DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;
CREATE POLICY "Super admins can delete profiles" ON profiles FOR DELETE USING (has_role('super_admin'));

-- ============================================================================
-- RLS POLICIES - CUSTOMERS
-- ============================================================================
DROP POLICY IF EXISTS "Staff can view customers" ON customers;
CREATE POLICY "Staff can view customers" ON customers FOR SELECT USING (has_any_role(ARRAY['super_admin', 'manager', 'sales_agent', 'logistics_officer']::user_role[]));

DROP POLICY IF EXISTS "Customers can view own company" ON customers;
CREATE POLICY "Customers can view own company" ON customers FOR SELECT USING (has_role('customer') AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.email = customers.email));

DROP POLICY IF EXISTS "Staff can insert customers" ON customers;
CREATE POLICY "Staff can insert customers" ON customers FOR INSERT WITH CHECK (has_any_role(ARRAY['super_admin', 'manager', 'sales_agent']::user_role[]));

DROP POLICY IF EXISTS "Staff can update customers" ON customers;
CREATE POLICY "Staff can update customers" ON customers FOR UPDATE USING (has_any_role(ARRAY['super_admin', 'manager', 'sales_agent']::user_role[]));

DROP POLICY IF EXISTS "Admins can delete customers" ON customers;
CREATE POLICY "Admins can delete customers" ON customers FOR DELETE USING (has_any_role(ARRAY['super_admin', 'manager']::user_role[]));

-- ============================================================================
-- RLS POLICIES - LEADS
-- ============================================================================
DROP POLICY IF EXISTS "Staff can view leads" ON leads;
CREATE POLICY "Staff can view leads" ON leads FOR SELECT USING (has_any_role(ARRAY['super_admin', 'manager', 'sales_agent']::user_role[]));

DROP POLICY IF EXISTS "Sales agents can create leads" ON leads;
CREATE POLICY "Sales agents can create leads" ON leads FOR INSERT WITH CHECK (has_any_role(ARRAY['super_admin', 'manager', 'sales_agent']::user_role[]));

DROP POLICY IF EXISTS "Sales agents can update leads" ON leads;
CREATE POLICY "Sales agents can update leads" ON leads FOR UPDATE USING (has_any_role(ARRAY['super_admin', 'manager']::user_role[]) OR (has_role('sales_agent') AND assigned_to = auth.uid()));

DROP POLICY IF EXISTS "Managers can delete leads" ON leads;
CREATE POLICY "Managers can delete leads" ON leads FOR DELETE USING (has_any_role(ARRAY['super_admin', 'manager']::user_role[]));

-- ============================================================================
-- RLS POLICIES - QUOTES
-- ============================================================================
DROP POLICY IF EXISTS "Staff can view quotes" ON quotes;
CREATE POLICY "Staff can view quotes" ON quotes FOR SELECT USING (has_any_role(ARRAY['super_admin', 'manager', 'sales_agent', 'logistics_officer']::user_role[]));

DROP POLICY IF EXISTS "Customers can view own quotes" ON quotes;
CREATE POLICY "Customers can view own quotes" ON quotes FOR SELECT USING (has_role('customer') AND EXISTS (SELECT 1 FROM customers WHERE customers.id = quotes.customer_id AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.email = customers.email)));

DROP POLICY IF EXISTS "Staff can create quotes" ON quotes;
CREATE POLICY "Staff can create quotes" ON quotes FOR INSERT WITH CHECK (has_any_role(ARRAY['super_admin', 'manager', 'sales_agent']::user_role[]));

DROP POLICY IF EXISTS "Staff can update quotes" ON quotes;
CREATE POLICY "Staff can update quotes" ON quotes FOR UPDATE USING (has_any_role(ARRAY['super_admin', 'manager', 'sales_agent']::user_role[]));

DROP POLICY IF EXISTS "Managers can delete quotes" ON quotes;
CREATE POLICY "Managers can delete quotes" ON quotes FOR DELETE USING (has_any_role(ARRAY['super_admin', 'manager']::user_role[]));

-- ============================================================================
-- RLS POLICIES - SHIPMENTS
-- ============================================================================
DROP POLICY IF EXISTS "Staff can view shipments" ON shipments;
CREATE POLICY "Staff can view shipments" ON shipments FOR SELECT USING (has_any_role(ARRAY['super_admin', 'manager', 'sales_agent', 'logistics_officer']::user_role[]));

DROP POLICY IF EXISTS "Customers can view own shipments" ON shipments;
CREATE POLICY "Customers can view own shipments" ON shipments FOR SELECT USING (has_role('customer') AND EXISTS (SELECT 1 FROM customers WHERE customers.id = shipments.customer_id AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.email = customers.email)));

DROP POLICY IF EXISTS "Staff can create shipments" ON shipments;
CREATE POLICY "Staff can create shipments" ON shipments FOR INSERT WITH CHECK (has_any_role(ARRAY['super_admin', 'manager', 'logistics_officer']::user_role[]));

DROP POLICY IF EXISTS "Staff can update shipments" ON shipments;
CREATE POLICY "Staff can update shipments" ON shipments FOR UPDATE USING (has_any_role(ARRAY['super_admin', 'manager', 'logistics_officer']::user_role[]));

DROP POLICY IF EXISTS "Managers can delete shipments" ON shipments;
CREATE POLICY "Managers can delete shipments" ON shipments FOR DELETE USING (has_any_role(ARRAY['super_admin', 'manager']::user_role[]));

-- ============================================================================
-- RLS POLICIES - SHIPMENT TIMELINE
-- ============================================================================
DROP POLICY IF EXISTS "View shipment timeline" ON shipment_timeline;
CREATE POLICY "View shipment timeline" ON shipment_timeline FOR SELECT USING (has_any_role(ARRAY['super_admin', 'manager', 'sales_agent', 'logistics_officer']::user_role[]) OR (has_role('customer') AND EXISTS (SELECT 1 FROM shipments s JOIN customers c ON c.id = s.customer_id WHERE s.id = shipment_timeline.shipment_id AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.email = c.email))));

DROP POLICY IF EXISTS "Staff can create timeline" ON shipment_timeline;
CREATE POLICY "Staff can create timeline" ON shipment_timeline FOR INSERT WITH CHECK (has_any_role(ARRAY['super_admin', 'manager', 'logistics_officer']::user_role[]));

-- ============================================================================
-- RLS POLICIES - DOCUMENTS
-- ============================================================================
DROP POLICY IF EXISTS "Staff can view documents" ON documents;
CREATE POLICY "Staff can view documents" ON documents FOR SELECT USING (has_any_role(ARRAY['super_admin', 'manager', 'sales_agent', 'logistics_officer']::user_role[]));

DROP POLICY IF EXISTS "Customers can view own documents" ON documents;
CREATE POLICY "Customers can view own documents" ON documents FOR SELECT USING (has_role('customer') AND EXISTS (SELECT 1 FROM customers WHERE customers.id = documents.customer_id AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.email = customers.email)));

DROP POLICY IF EXISTS "Staff can upload documents" ON documents;
CREATE POLICY "Staff can upload documents" ON documents FOR INSERT WITH CHECK (has_any_role(ARRAY['super_admin', 'manager', 'sales_agent', 'logistics_officer']::user_role[]));

DROP POLICY IF EXISTS "Managers can delete documents" ON documents;
CREATE POLICY "Managers can delete documents" ON documents FOR DELETE USING (has_any_role(ARRAY['super_admin', 'manager']::user_role[]));

-- ============================================================================
-- RLS POLICIES - BLOG
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can view published posts" ON blog_posts;
CREATE POLICY "Anyone can view published posts" ON blog_posts FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Staff can view all posts" ON blog_posts;
CREATE POLICY "Staff can view all posts" ON blog_posts FOR SELECT USING (has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[]));

DROP POLICY IF EXISTS "Content managers can create posts" ON blog_posts;
CREATE POLICY "Content managers can create posts" ON blog_posts FOR INSERT WITH CHECK (has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[]));

DROP POLICY IF EXISTS "Content managers can update posts" ON blog_posts;
CREATE POLICY "Content managers can update posts" ON blog_posts FOR UPDATE USING (has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[]));

DROP POLICY IF EXISTS "Admins can delete posts" ON blog_posts;
CREATE POLICY "Admins can delete posts" ON blog_posts FOR DELETE USING (has_any_role(ARRAY['super_admin', 'manager']::user_role[]));

-- Blog public read
DROP POLICY IF EXISTS "Anyone can view blog categories" ON blog_categories;
CREATE POLICY "Anyone can view blog categories" ON blog_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view blog tags" ON blog_tags;
CREATE POLICY "Anyone can view blog tags" ON blog_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view blog authors" ON blog_authors;
CREATE POLICY "Anyone can view blog authors" ON blog_authors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view post tags" ON blog_post_tags;
CREATE POLICY "Anyone can view post tags" ON blog_post_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage categories" ON blog_categories;
CREATE POLICY "Staff can manage categories" ON blog_categories FOR ALL USING (has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[]));

DROP POLICY IF EXISTS "Staff can manage tags" ON blog_tags;
CREATE POLICY "Staff can manage tags" ON blog_tags FOR ALL USING (has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[]));

DROP POLICY IF EXISTS "Staff can manage authors" ON blog_authors;
CREATE POLICY "Staff can manage authors" ON blog_authors FOR ALL USING (has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[]));

DROP POLICY IF EXISTS "Staff can manage post tags" ON blog_post_tags;
CREATE POLICY "Staff can manage post tags" ON blog_post_tags FOR ALL USING (has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[]));

-- ============================================================================
-- RLS POLICIES - FAQS
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can view published FAQs" ON faqs;
CREATE POLICY "Anyone can view published FAQs" ON faqs FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Staff can view all FAQs" ON faqs;
CREATE POLICY "Staff can view all FAQs" ON faqs FOR SELECT USING (has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[]));

DROP POLICY IF EXISTS "Content managers can manage FAQs" ON faqs;
CREATE POLICY "Content managers can manage FAQs" ON faqs FOR ALL USING (has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[]));

-- ============================================================================
-- RLS POLICIES - ACTIVITY LOG
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own activity" ON activity_log;
CREATE POLICY "Users can view own activity" ON activity_log FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all activity" ON activity_log;
CREATE POLICY "Admins can view all activity" ON activity_log FOR SELECT USING (has_any_role(ARRAY['super_admin', 'manager']::user_role[]));

DROP POLICY IF EXISTS "Authenticated users can log activity" ON activity_log;
CREATE POLICY "Authenticated users can log activity" ON activity_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- RLS POLICIES - SETTINGS
-- ============================================================================
DROP POLICY IF EXISTS "Staff can view settings" ON settings;
CREATE POLICY "Staff can view settings" ON settings FOR SELECT USING (has_any_role(ARRAY['super_admin', 'manager']::user_role[]));

DROP POLICY IF EXISTS "Super admins can manage settings" ON settings;
CREATE POLICY "Super admins can manage settings" ON settings FOR ALL USING (has_role('super_admin'));

-- ============================================================================
-- RLS POLICIES - EMAIL CAMPAIGNS
-- ============================================================================
DROP POLICY IF EXISTS "Managers can view campaigns" ON email_campaigns;
CREATE POLICY "Managers can view campaigns" ON email_campaigns FOR SELECT USING (has_any_role(ARRAY['super_admin', 'manager']::user_role[]));

DROP POLICY IF EXISTS "Managers can manage campaigns" ON email_campaigns;
CREATE POLICY "Managers can manage campaigns" ON email_campaigns FOR ALL USING (has_any_role(ARRAY['super_admin', 'manager']::user_role[]));

-- ============================================================================
-- RLS POLICIES - BLOG MEDIA
-- ============================================================================
DROP POLICY IF EXISTS "Staff can view all media" ON blog_media;
CREATE POLICY "Staff can view all media" ON blog_media FOR SELECT USING (has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[]));

DROP POLICY IF EXISTS "Content managers can upload media" ON blog_media;
CREATE POLICY "Content managers can upload media" ON blog_media FOR INSERT WITH CHECK (has_any_role(ARRAY['super_admin', 'manager', 'content_manager']::user_role[]));

DROP POLICY IF EXISTS "Admins can delete media" ON blog_media;
CREATE POLICY "Admins can delete media" ON blog_media FOR DELETE USING (has_any_role(ARRAY['super_admin', 'manager']::user_role[]));

-- ============================================================================
-- RLS POLICIES - TRACKING TOKENS
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can view tracking by token" ON tracking_tokens;
CREATE POLICY "Anyone can view tracking by token" ON tracking_tokens FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can insert tracking tokens" ON tracking_tokens;
CREATE POLICY "Staff can insert tracking tokens" ON tracking_tokens FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('super_admin', 'manager', 'logistics_officer', 'sales_agent')));

DROP POLICY IF EXISTS "Staff can update tracking tokens" ON tracking_tokens;
CREATE POLICY "Staff can update tracking tokens" ON tracking_tokens FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('super_admin', 'manager', 'logistics_officer', 'sales_agent')));

DROP POLICY IF EXISTS "Admins can delete tracking tokens" ON tracking_tokens;
CREATE POLICY "Admins can delete tracking tokens" ON tracking_tokens FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('super_admin', 'manager')));

-- Allow customers to view their own tracking tokens
DROP POLICY IF EXISTS "Customers can view own tracking tokens" ON tracking_tokens;
CREATE POLICY "Customers can view own tracking tokens" ON tracking_tokens FOR SELECT USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'customer'
    AND p.email IN (SELECT email FROM customers WHERE id = tracking_tokens.customer_id)
  )
);

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('documents', 'documents', false),
  ('invoices', 'invoices', false),
  ('shipment-files', 'shipment-files', false),
  ('blog-images', 'blog-images', true),
  ('customer-files', 'customer-files', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================
-- Documents bucket
DROP POLICY IF EXISTS "Staff can upload documents" ON storage.objects;
CREATE POLICY "Staff can upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'manager', 'sales_agent', 'logistics_officer')));

DROP POLICY IF EXISTS "Staff can view documents" ON storage.objects;
CREATE POLICY "Staff can view documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'manager', 'sales_agent', 'logistics_officer', 'customer')));

DROP POLICY IF EXISTS "Managers can delete documents" ON storage.objects;
CREATE POLICY "Managers can delete documents" ON storage.objects FOR DELETE USING (bucket_id = 'documents' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'manager')));

-- Invoices bucket
DROP POLICY IF EXISTS "Staff can upload invoices" ON storage.objects;
CREATE POLICY "Staff can upload invoices" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'invoices' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'manager', 'logistics_officer')));

DROP POLICY IF EXISTS "Staff and customers can view invoices" ON storage.objects;
CREATE POLICY "Staff and customers can view invoices" ON storage.objects FOR SELECT USING (bucket_id = 'invoices' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'manager', 'sales_agent', 'logistics_officer', 'customer')));

-- Shipment files bucket
DROP POLICY IF EXISTS "Staff can upload shipment files" ON storage.objects;
CREATE POLICY "Staff can upload shipment files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'shipment-files' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'manager', 'logistics_officer')));

DROP POLICY IF EXISTS "Staff and customers can view shipment files" ON storage.objects;
CREATE POLICY "Staff and customers can view shipment files" ON storage.objects FOR SELECT USING (bucket_id = 'shipment-files' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'manager', 'sales_agent', 'logistics_officer', 'customer')));

-- Blog images bucket
DROP POLICY IF EXISTS "Content managers can upload blog images" ON storage.objects;
CREATE POLICY "Content managers can upload blog images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'manager', 'content_manager')));

DROP POLICY IF EXISTS "Anyone can view blog images" ON storage.objects;
CREATE POLICY "Anyone can view blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Managers can delete blog images" ON storage.objects;
CREATE POLICY "Managers can delete blog images" ON storage.objects FOR DELETE USING (bucket_id = 'blog-images' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'manager')));

-- Customer files bucket
DROP POLICY IF EXISTS "Staff can upload customer files" ON storage.objects;
CREATE POLICY "Staff can upload customer files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'customer-files' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'manager', 'sales_agent')));

DROP POLICY IF EXISTS "Staff and customers can view customer files" ON storage.objects;
CREATE POLICY "Staff and customers can view customer files" ON storage.objects FOR SELECT USING (bucket_id = 'customer-files' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'manager', 'sales_agent', 'customer')));

-- ============================================================================
-- CREATE ADMIN USER
-- ============================================================================
-- IMPORTANT: Replace 'YOUR_ADMIN_UUID' with the actual UUID from auth.users after creating the user
-- First create the auth user via Supabase Dashboard > Authentication > Users > Create User
-- Then uncomment and run the INSERT below with the correct UUID

-- INSERT INTO profiles (id, email, full_name, role, is_active)
-- VALUES (
--   'YOUR_ADMIN_UUID_HERE',
--   'admin@nitramclearing.co.zm',
--   'Demo Admin',
--   'super_admin',
--   true
-- ) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run these queries to verify everything was created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- SELECT id, email, full_name, role, is_active FROM profiles;
