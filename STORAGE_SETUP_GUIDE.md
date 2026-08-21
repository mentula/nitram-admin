# Storage Buckets Setup Guide

## Problem
Blog uploads and document uploads are failing because the required Supabase Storage buckets don't exist yet.

## Solution
Create the storage buckets manually in the Supabase Dashboard.

---

## Step-by-Step Instructions

### 1. Open Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Log in to your account
3. Select your project: **ekuifrbgozeqxvzmbnse** (nitram-elevate)

### 2. Navigate to Storage

1. In the left sidebar, click **Storage**
2. You'll see the Storage interface

---

## Create Required Buckets

You need to create **3 buckets**. Follow these instructions for each:

### Bucket 1: `public`

**Purpose:** Blog images, website images, logos

1. Click **"New bucket"** button
2. Fill in:
   - **Name:** `public`
   - **Public bucket:** ✅ **Enable** (Toggle ON)
   - **File size limit:** `10 MB`
   - **Allowed MIME types:** 
     ```
     image/jpeg
     image/jpg
     image/png
     image/gif
     image/webp
     image/svg+xml
     ```
3. Click **"Create bucket"**
4. Click **"Create policy"** (if prompted)
5. Select **"For full customization, create a policy from scratch"**
6. Create these policies:

   **Policy 1: Public Read**
   - Policy name: `Public Read Access`
   - Allowed operation: `SELECT`
   - Target roles: `public`
   - Policy definition:
     ```sql
     bucket_id = 'public'
     ```

   **Policy 2: Authenticated Write**
   - Policy name: `Authenticated Upload`
   - Allowed operation: `INSERT`
   - Target roles: `authenticated`
   - Policy definition:
     ```sql
     bucket_id = 'public'
     ```

   **Policy 3: Authenticated Update**
   - Policy name: `Authenticated Update`
   - Allowed operation: `UPDATE`
   - Target roles: `authenticated`
   - Policy definition:
     ```sql
     bucket_id = 'public'
     ```

   **Policy 4: Authenticated Delete**
   - Policy name: `Authenticated Delete`
   - Allowed operation: `DELETE`
   - Target roles: `authenticated`
   - Policy definition:
     ```sql
     bucket_id = 'public'
     ```

---

### Bucket 2: `company-documents`

**Purpose:** Company documents (licenses, certificates, compliance docs)

1. Click **"New bucket"** button
2. Fill in:
   - **Name:** `company-documents`
   - **Public bucket:** ❌ **Disable** (Toggle OFF - private bucket)
   - **File size limit:** `50 MB`
   - **Allowed MIME types:**
     ```
     application/pdf
     application/msword
     application/vnd.openxmlformats-officedocument.wordprocessingml.document
     application/vnd.ms-excel
     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
     image/jpeg
     image/jpg
     image/png
     image/gif
     image/webp
     ```
3. Click **"Create bucket"**
4. Create these policies:

   **Policy 1: Authenticated Read**
   - Policy name: `Authenticated Read`
   - Allowed operation: `SELECT`
   - Target roles: `authenticated`
   - Policy definition:
     ```sql
     bucket_id = 'company-documents'
     ```

   **Policy 2: Authenticated Upload**
   - Policy name: `Authenticated Upload`
   - Allowed operation: `INSERT`
   - Target roles: `authenticated`
   - Policy definition:
     ```sql
     bucket_id = 'company-documents'
     ```

   **Policy 3: Authenticated Update**
   - Policy name: `Authenticated Update`
   - Allowed operation: `UPDATE`
   - Target roles: `authenticated`
   - Policy definition:
     ```sql
     bucket_id = 'company-documents'
     ```

   **Policy 4: Authenticated Delete**
   - Policy name: `Authenticated Delete`
   - Allowed operation: `DELETE`
   - Target roles: `authenticated`
   - Policy definition:
     ```sql
     bucket_id = 'company-documents'
     ```

---

### Bucket 3: `assessment-documents`

**Purpose:** Documents uploaded with assessment/quote forms

1. Click **"New bucket"** button
2. Fill in:
   - **Name:** `assessment-documents`
   - **Public bucket:** ❌ **Disable** (Toggle OFF - private bucket)
   - **File size limit:** `10 MB`
   - **Allowed MIME types:**
     ```
     application/pdf
     application/msword
     application/vnd.openxmlformats-officedocument.wordprocessingml.document
     application/vnd.ms-excel
     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
     image/jpeg
     image/jpg
     image/png
     ```
3. Click **"Create bucket"**
4. Create these policies:

   **Policy 1: Public Upload** (needed for assessment form)
   - Policy name: `Public Upload`
   - Allowed operation: `INSERT`
   - Target roles: `public`
   - Policy definition:
     ```sql
     bucket_id = 'assessment-documents'
     ```

   **Policy 2: Authenticated Read**
   - Policy name: `Authenticated Read`
   - Allowed operation: `SELECT`
   - Target roles: `authenticated`
   - Policy definition:
     ```sql
     bucket_id = 'assessment-documents'
     ```

   **Policy 3: Authenticated Update**
   - Policy name: `Authenticated Update`
   - Allowed operation: `UPDATE`
   - Target roles: `authenticated`
   - Policy definition:
     ```sql
     bucket_id = 'assessment-documents'
     ```

   **Policy 4: Authenticated Delete**
   - Policy name: `Authenticated Delete`
   - Allowed operation: `DELETE`
   - Target roles: `authenticated`
   - Policy definition:
     ```sql
     bucket_id = 'assessment-documents'
     ```

---

## Verify Setup

After creating all buckets, you should see:

✅ **public** - Public bucket, 10MB limit
✅ **company-documents** - Private bucket, 50MB limit  
✅ **assessment-documents** - Private bucket, 10MB limit

Each bucket should have 4 policies configured.

---

## Test Uploads

### Test Blog Image Upload:
1. Go to `/admin/blog` in your app
2. Click "New Post"
3. Try uploading a featured image
4. Try adding inline images in the editor
5. Should work without errors

### Test Document Upload:
1. Go to `/admin/documents` in your app
2. Drag and drop a PDF file
3. Should upload successfully

### Test Assessment Form:
1. Go to `/assessment` on your website
2. Fill out the form
3. Upload documents (invoice, bill of lading, etc.)
4. Submit
5. Should succeed

---

## Folder Structure

After creating buckets, these folders will be created automatically when files are uploaded:

### `public` bucket:
- `blog-images/` - Blog post inline images
- `blog-featured/` - Featured images for blog posts
- `blog-authors/` - Author profile pictures
- `logos/` - Company logo uploads
- `website-images/` - General website images

### `company-documents` bucket:
- `License/` - Company licenses
- `Certificate/` - Certificates
- `Compliance/` - Compliance documents
- `Contracts/` - Contracts
- `Insurance/` - Insurance documents
- `Other/` - Miscellaneous documents

### `assessment-documents` bucket:
- `{quote-id}/commercial-invoice/`
- `{quote-id}/airway-bill/`
- `{quote-id}/bill-of-lading/`
- `{quote-id}/cargo-manifest/`
- `{quote-id}/certificate-of-origin/`
- `{quote-id}/import-permit/`
- `{quote-id}/additional/`

---

## Quick Setup (Alternative Method)

If you prefer to use SQL directly:

1. Go to **SQL Editor** in Supabase Dashboard
2. Create a new query
3. Copy the contents of `supabase/migrations/004_storage_buckets.sql`
4. Run the query
5. Done! All buckets and policies created at once.

---

## Troubleshooting

### Issue: "Bucket already exists"
- **Solution:** Skip creating that bucket, it's already set up

### Issue: "Policy already exists"
- **Solution:** Skip that policy, or delete the existing one and recreate it

### Issue: "Upload fails with 403 Forbidden"
- **Solution:** Check that policies are created correctly for that bucket

### Issue: "Cannot see uploaded images"
- **Solution:** Make sure `public` bucket has "Public bucket" enabled

### Issue: "RLS policy error"
- **Solution:** Make sure you're logged in when testing authenticated uploads

---

## Support

If you encounter issues:
1. Check browser console for specific error messages
2. Verify bucket names match exactly (case-sensitive)
3. Confirm policies are applied to correct buckets
4. Test with a fresh browser session (clear cache)

---

**Once all 3 buckets are created, your blog uploads and document uploads will work!** 🎉
