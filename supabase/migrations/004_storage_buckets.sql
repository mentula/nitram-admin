-- ============================================================================
-- STORAGE BUCKETS SETUP
-- ============================================================================
-- This migration creates all required storage buckets for the application

-- Create public bucket for blog and website content
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public',
  'public',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create company-documents bucket for private documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-documents',
  'company-documents',
  false,
  52428800, -- 50MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create assessment-documents bucket for assessment form uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assessment-documents',
  'assessment-documents',
  false,
  10485760, -- 10MB per file
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ]::text[]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES - PUBLIC BUCKET
-- ============================================================================

-- Allow public read access to public bucket
CREATE POLICY "Public bucket - public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'public');

-- Allow authenticated users to upload to public bucket (blog images, logos, etc.)
CREATE POLICY "Public bucket - authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'public');

-- Allow authenticated users to update their uploads
CREATE POLICY "Public bucket - authenticated update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'public');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Public bucket - authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'public');

-- ============================================================================
-- STORAGE POLICIES - COMPANY DOCUMENTS BUCKET
-- ============================================================================

-- Allow authenticated users to read company documents
CREATE POLICY "Company documents - authenticated read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'company-documents');

-- Allow authenticated users to upload company documents
CREATE POLICY "Company documents - authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-documents');

-- Allow authenticated users to update company documents
CREATE POLICY "Company documents - authenticated update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'company-documents');

-- Allow authenticated users to delete company documents
CREATE POLICY "Company documents - authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'company-documents');

-- ============================================================================
-- STORAGE POLICIES - ASSESSMENT DOCUMENTS BUCKET
-- ============================================================================

-- Allow authenticated users to read assessment documents
CREATE POLICY "Assessment documents - authenticated read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'assessment-documents');

-- Allow public (anonymous) users to upload assessment documents
-- This is needed for the public assessment form
CREATE POLICY "Assessment documents - public upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'assessment-documents');

-- Allow authenticated users to update assessment documents
CREATE POLICY "Assessment documents - authenticated update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'assessment-documents');

-- Allow authenticated users to delete assessment documents
CREATE POLICY "Assessment documents - authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'assessment-documents');

-- ============================================================================
-- FOLDER STRUCTURE DOCUMENTATION
-- ============================================================================

-- The following folders should be used in the application:

-- PUBLIC BUCKET:
--   blog-images/        - Blog post inline images
--   blog-featured/      - Blog post featured images
--   blog-authors/       - Author profile images
--   logos/              - Company logo uploads
--   website-images/     - General website images

-- COMPANY-DOCUMENTS BUCKET:
--   License/            - Company licenses
--   Certificate/        - Certificates
--   Compliance/         - Compliance documents
--   Contracts/          - Contract documents
--   Insurance/          - Insurance documents
--   Other/              - Other documents

-- ASSESSMENT-DOCUMENTS BUCKET:
--   {lead-id}/          - Documents organized by lead ID
--     commercial-invoice/
--     airway-bill/
--     bill-of-lading/
--     cargo-manifest/
--     certificate-of-origin/
--     import-permit/
--     additional/

COMMENT ON TABLE storage.buckets IS 'Storage buckets for file uploads: public (blog/website), company-documents (private docs), assessment-documents (quote attachments)';
