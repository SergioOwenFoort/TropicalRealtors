-- Create missing database tables for frontend functionality
-- Run this in your Supabase Dashboard > SQL Editor

-- ==========================================
-- Create saved_searches table
-- ==========================================

CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  search_params jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_created_at ON saved_searches(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
DROP POLICY IF EXISTS "Users can manage their own saved searches" ON saved_searches;
CREATE POLICY "Users can manage their own saved searches" ON saved_searches
  FOR ALL USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON saved_searches TO authenticated;
GRANT ALL ON saved_searches TO service_role;

-- ==========================================
-- Create property_views table (for tracking property views)
-- ==========================================

CREATE TABLE IF NOT EXISTS property_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id bigint REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  viewed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  session_id text
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_user_id ON property_views(user_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewed_at ON property_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_property_views_ip_address ON property_views(ip_address);

-- Enable RLS
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

-- Create policies for property_views
DROP POLICY IF EXISTS "Anyone can insert property views" ON property_views;
CREATE POLICY "Anyone can insert property views" ON property_views
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own property views" ON property_views;
CREATE POLICY "Users can view their own property views" ON property_views
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Grant permissions
GRANT ALL ON property_views TO authenticated;
GRANT ALL ON property_views TO service_role;
GRANT SELECT, INSERT ON property_views TO anon;

-- ==========================================
-- Create click_tracking table (for tracking clicks on properties/carousel)
-- ==========================================

CREATE TABLE IF NOT EXISTS click_tracking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  element_type text NOT NULL CHECK (element_type IN ('property', 'carousel_slide', 'button', 'link')),
  element_id text NOT NULL, -- Can be property_id, slide_id, etc.
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  clicked_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  session_id text,
  page_url text,
  referrer text,
  metadata jsonb DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_click_tracking_element_type ON click_tracking(element_type);
CREATE INDEX IF NOT EXISTS idx_click_tracking_element_id ON click_tracking(element_id);
CREATE INDEX IF NOT EXISTS idx_click_tracking_user_id ON click_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_click_tracking_clicked_at ON click_tracking(clicked_at);
CREATE INDEX IF NOT EXISTS idx_click_tracking_ip_address ON click_tracking(ip_address);

-- Enable RLS
ALTER TABLE click_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for click_tracking
DROP POLICY IF EXISTS "Anyone can insert click tracking" ON click_tracking;
CREATE POLICY "Anyone can insert click tracking" ON click_tracking
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view click tracking" ON click_tracking;
CREATE POLICY "Authenticated users can view click tracking" ON click_tracking
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Grant permissions
GRANT ALL ON click_tracking TO authenticated;
GRANT ALL ON click_tracking TO service_role;
GRANT SELECT, INSERT ON click_tracking TO anon;

-- ==========================================
-- Create trigger function for updated_at columns
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_saved_searches_updated_at ON saved_searches;
CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- Verify tables were created
-- ==========================================

SELECT 'saved_searches' as table_name, COUNT(*) as record_count FROM saved_searches
UNION ALL
SELECT 'property_views' as table_name, COUNT(*) as record_count FROM property_views
UNION ALL  
SELECT 'click_tracking' as table_name, COUNT(*) as record_count FROM click_tracking;

-- Success message
SELECT 'Missing tables created successfully! Frontend should now work properly.' as message;
