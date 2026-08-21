-- Create tracking_tokens table for client shipment tracking
CREATE TABLE IF NOT EXISTS tracking_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(8) UNIQUE NOT NULL,
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 1 CHECK (current_step >= 1 AND current_step <= 8),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on token for fast lookups
CREATE INDEX idx_tracking_tokens_token ON tracking_tokens(token);
CREATE INDEX idx_tracking_tokens_shipment_id ON tracking_tokens(shipment_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_tracking_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tracking_tokens_updated_at
  BEFORE UPDATE ON tracking_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_tracking_tokens_updated_at();

-- RLS Policies for tracking_tokens
ALTER TABLE tracking_tokens ENABLE ROW LEVEL SECURITY;

-- Public can read tracking info by token (no authentication required)
CREATE POLICY "Anyone can view tracking by token"
  ON tracking_tokens
  FOR SELECT
  USING (true);

-- Only authenticated staff can insert tracking tokens
CREATE POLICY "Staff can insert tracking tokens"
  ON tracking_tokens
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('super_admin', 'manager', 'logistics_officer', 'sales_agent')
    )
  );

-- Only authenticated staff can update tracking tokens
CREATE POLICY "Staff can update tracking tokens"
  ON tracking_tokens
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('super_admin', 'manager', 'logistics_officer', 'sales_agent')
    )
  );

-- Only super admin and managers can delete tracking tokens
CREATE POLICY "Admins can delete tracking tokens"
  ON tracking_tokens
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('super_admin', 'manager')
    )
  );

-- Create blog_post_tags junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS blog_post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, tag_id)
);

CREATE INDEX idx_blog_post_tags_post_id ON blog_post_tags(post_id);
CREATE INDEX idx_blog_post_tags_tag_id ON blog_post_tags(tag_id);

-- RLS for blog_post_tags
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blog post tags"
  ON blog_post_tags
  FOR SELECT
  USING (true);

CREATE POLICY "Content managers can manage blog post tags"
  ON blog_post_tags
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('super_admin', 'manager', 'content_manager')
    )
  );
