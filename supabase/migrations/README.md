# Database Migrations

## How to Apply Migrations

### Using Supabase CLI
```bash
supabase db push
```

### Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the content of the migration file
4. Run the SQL

### Manual Application
Execute the SQL files in order:
1. `001_initial_schema.sql`
2. `002_rls_policies.sql`
3. `003_tracking_tokens.sql`

## Migration 003: Tracking Tokens

This migration adds:
- **tracking_tokens table**: Stores shipment tracking tokens for public client access
  - 8-character unique tokens
  - Links to shipments
  - Tracks current step (1-8) in the clearance process
  - Allows admin notes
  
- **blog_post_tags table**: Junction table for many-to-many relationship between blog posts and tags

### RLS Policies
- Public can view tracking by token (no auth required)
- Only authenticated staff can create/update tracking tokens
- Only admins can delete tracking tokens

## Verifying Migration

After running the migration, verify with:
```sql
-- Check tracking_tokens table exists
SELECT * FROM tracking_tokens LIMIT 1;

-- Check blog_post_tags table exists
SELECT * FROM blog_post_tags LIMIT 1;

-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('tracking_tokens', 'blog_post_tags');
```
