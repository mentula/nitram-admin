-- ============================================================================
-- NITRAM LOGISTICS - DIAGNOSTIC & FIX SCRIPT
-- Run this in Supabase SQL Editor to diagnose and fix database issues
-- ============================================================================

-- ============================================================================
-- STEP 1: DIAGNOSTIC - Check what tables exist
-- ============================================================================
SELECT '=== TABLES EXISTS ===' as section;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- ============================================================================
-- STEP 2: DIAGNOSTIC - Check if customers table has required columns
-- ============================================================================
SELECT '=== CUSTOMERS COLUMNS ===' as section;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'customers'
ORDER BY ordinal_position;

-- ============================================================================
-- STEP 3: DIAGNOSTIC - Check if leads table has required columns
-- ============================================================================
SELECT '=== LEADS COLUMNS ===' as section;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'leads'
ORDER BY ordinal_position;

-- ============================================================================
-- STEP 4: DIAGNOSTIC - Check if profiles table exists
-- ============================================================================
SELECT '=== PROFILES EXISTS ===' as section;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles';

-- ============================================================================
-- STEP 5: DIAGNOSTIC - Check RLS policies for customers
-- ============================================================================
SELECT '=== CUSTOMERS RLS POLICIES ===' as section;
SELECT policyname, cmd, permissive, roles
FROM pg_policies
WHERE tablename = 'customers'
ORDER BY cmd, policyname;

-- ============================================================================
-- STEP 6: DIAGNOSTIC - Check RLS policies for leads
-- ============================================================================
SELECT '=== LEADS RLS POLICIES ===' as section;
SELECT policyname, cmd, permissive, roles
FROM pg_policies
WHERE tablename = 'leads'
ORDER BY cmd, policyname;

-- ============================================================================
-- STEP 7: FIX - Create tables if missing
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  phone TEXT,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
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
  status TEXT DEFAULT 'prospect',
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT,
  company_name TEXT,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_needed TEXT,
  notes TEXT,
  status TEXT DEFAULT 'new',
  score INTEGER DEFAULT 0,
  approved BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES profiles(id),
  converted_to_customer UUID REFERENCES customers(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 8: FIX - Add missing columns if tables exist but columns are missing
-- ============================================================================

-- Customers table missing columns
ALTER TABLE customers ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Leads table missing columns
ALTER TABLE leads ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_to_customer UUID REFERENCES customers(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- ============================================================================
-- STEP 9: FIX - Create indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- ============================================================================
-- STEP 10: FIX - Enable RLS and create policies
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;

DROP POLICY IF EXISTS "Staff can view customers" ON customers;
DROP POLICY IF EXISTS "Customers can view own company" ON customers;
DROP POLICY IF EXISTS "Staff can insert customers" ON customers;
DROP POLICY IF EXISTS "Staff can update customers" ON customers;
DROP POLICY IF EXISTS "Admins can delete customers" ON customers;

DROP POLICY IF EXISTS "Staff can view leads" ON leads;
DROP POLICY IF EXISTS "Sales agents can create leads" ON leads;
DROP POLICY IF EXISTS "Sales agents can update leads" ON leads;
DROP POLICY IF EXISTS "Managers can delete leads" ON leads;

-- Helper functions
CREATE OR REPLACE FUNCTION has_role(required_role text)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = required_role AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_any_role(required_roles text[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ANY(required_roles) AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (has_any_role(ARRAY['super_admin', 'manager']::text[]));
CREATE POLICY "Super admins can insert profiles" ON profiles FOR INSERT WITH CHECK (has_role('super_admin'));
CREATE POLICY "Super admins can delete profiles" ON profiles FOR DELETE USING (has_role('super_admin'));

-- Customers policies
CREATE POLICY "Staff can view customers" ON customers FOR SELECT USING (has_any_role(ARRAY['super_admin', 'manager', 'sales_agent', 'logistics_officer']::text[]));
CREATE POLICY "Customers can view own company" ON customers FOR SELECT USING (has_role('customer') AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.email = customers.email));
CREATE POLICY "Staff can insert customers" ON customers FOR INSERT WITH CHECK (has_any_role(ARRAY['super_admin', 'manager', 'sales_agent']::text[]));
CREATE POLICY "Staff can update customers" ON customers FOR UPDATE USING (has_any_role(ARRAY['super_admin', 'manager', 'sales_agent']::text[]));
CREATE POLICY "Admins can delete customers" ON customers FOR DELETE USING (has_any_role(ARRAY['super_admin', 'manager']::text[]));

-- Leads policies
CREATE POLICY "Staff can view leads" ON leads FOR SELECT USING (has_any_role(ARRAY['super_admin', 'manager', 'sales_agent']::text[]));
CREATE POLICY "Sales agents can create leads" ON leads FOR INSERT WITH CHECK (has_any_role(ARRAY['super_admin', 'manager', 'sales_agent']::text[]));
CREATE POLICY "Sales agents can update leads" ON leads FOR UPDATE USING (has_any_role(ARRAY['super_admin', 'manager']::text[]) OR (has_role('sales_agent') AND assigned_to = auth.uid()));
CREATE POLICY "Managers can delete leads" ON leads FOR DELETE USING (has_any_role(ARRAY['super_admin', 'manager']::text[]));

-- ============================================================================
-- STEP 11: VERIFICATION
-- ============================================================================
SELECT '=== FINAL VERIFICATION ===' as section;
SELECT 
  'customers' as table_name, 
  COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'customers'
UNION ALL
SELECT 
  'leads' as table_name, 
  COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'leads'
UNION ALL
SELECT 
  'profiles' as table_name, 
  COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles';

SELECT '=== RLS POLICIES COUNT ===' as section;
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('customers', 'leads', 'profiles')
GROUP BY tablename
ORDER BY tablename;
