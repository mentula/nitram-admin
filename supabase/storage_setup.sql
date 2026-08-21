-- ============================================================================
-- STORAGE BUCKETS SETUP
-- ============================================================================

-- Create storage buckets
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

-- Documents bucket policies
CREATE POLICY "Staff can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'manager', 'sales_agent', 'logistics_officer')
  )
);

CREATE POLICY "Staff can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'manager', 'sales_agent', 'logistics_officer', 'customer')
  )
);

CREATE POLICY "Managers can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'manager')
  )
);

-- Invoices bucket policies
CREATE POLICY "Staff can upload invoices"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'invoices' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'manager', 'logistics_officer')
  )
);

CREATE POLICY "Staff and customers can view invoices"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'invoices' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'manager', 'sales_agent', 'logistics_officer', 'customer')
  )
);

-- Shipment files bucket policies
CREATE POLICY "Staff can upload shipment files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'shipment-files' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'manager', 'logistics_officer')
  )
);

CREATE POLICY "Staff and customers can view shipment files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'shipment-files' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'manager', 'sales_agent', 'logistics_officer', 'customer')
  )
);

-- Blog images bucket policies (public bucket)
CREATE POLICY "Content managers can upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'manager', 'content_manager')
  )
);

CREATE POLICY "Anyone can view blog images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

CREATE POLICY "Managers can delete blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'manager')
  )
);

-- Customer files bucket policies
CREATE POLICY "Staff can upload customer files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'customer-files' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'manager', 'sales_agent')
  )
);

CREATE POLICY "Staff and customers can view customer files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'customer-files' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'manager', 'sales_agent', 'customer')
  )
);
