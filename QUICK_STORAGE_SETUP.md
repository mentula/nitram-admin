# Quick Storage Setup Reference

## Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Select project: **ekuifrbgozeqxvzmbnse**
3. Click **Storage** in sidebar

---

## Create 3 Buckets

### 1. Bucket: `public`
- **Public:** ✅ YES
- **Size limit:** 10 MB
- **MIME types:** image/jpeg, image/jpg, image/png, image/gif, image/webp, image/svg+xml
- **Policies:** 
  - SELECT for public
  - INSERT/UPDATE/DELETE for authenticated

### 2. Bucket: `company-documents`
- **Public:** ❌ NO
- **Size limit:** 50 MB
- **MIME types:** pdf, doc, docx, xls, xlsx, images
- **Policies:** SELECT/INSERT/UPDATE/DELETE for authenticated

### 3. Bucket: `assessment-documents`
- **Public:** ❌ NO
- **Size limit:** 10 MB
- **MIME types:** pdf, doc, docx, xls, xlsx, images
- **Policies:** 
  - INSERT for public (assessment form uploads)
  - SELECT/UPDATE/DELETE for authenticated

---

## Policy Quick Reference

For each bucket, add 4 policies:

```sql
-- READ
bucket_id = 'bucket-name' -- SELECT, role: public or authenticated

-- UPLOAD
bucket_id = 'bucket-name' -- INSERT, role: public or authenticated

-- UPDATE
bucket_id = 'bucket-name' -- UPDATE, role: authenticated

-- DELETE
bucket_id = 'bucket-name' -- DELETE, role: authenticated
```

---

## Test After Setup

✅ Blog → New Post → Upload image → Should work
✅ Documents → Upload file → Should work
✅ Assessment form → Upload documents → Should work

---

## Alternative: Run SQL

Copy `supabase/migrations/004_storage_buckets.sql` to SQL Editor and run it. Done!
