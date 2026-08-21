-- ============================================================================
-- NITRAM LOGISTICS - ALTER TABLE MIGRATION
-- Run this if you already have tables but are missing columns like "approved"
-- ============================================================================

-- Leads table - add missing columns
ALTER TABLE leads ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_to_customer UUID REFERENCES customers(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- Quotes table - add missing columns if needed
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id);

-- Customers table - add missing columns if needed
ALTER TABLE customers ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- Shipments table - add missing columns if needed
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- Documents table - add missing columns if needed
ALTER TABLE documents ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES profiles(id);

-- FAQS table - add missing columns if needed
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);

-- Email campaigns table - add missing columns if needed
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- Settings table - add missing columns if needed
ALTER TABLE settings ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);

-- Activity log table - add missing columns if needed
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id);

-- Blog posts table - add missing columns if needed
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'leads'
  AND column_name IN ('approved', 'score', 'assigned_to', 'converted_to_customer', 'created_by')
ORDER BY ordinal_position;
