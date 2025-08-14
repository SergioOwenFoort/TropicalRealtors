-- Create listing_urls table
CREATE TABLE IF NOT EXISTS listing_urls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  error TEXT,
  UNIQUE(url, user_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE listing_urls ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own listing URLs" ON listing_urls;
DROP POLICY IF EXISTS "Users can insert own listing URLs" ON listing_urls;

-- Create policies
CREATE POLICY "Users can view own listing URLs"
  ON listing_urls FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own listing URLs"
  ON listing_urls FOR INSERT
  WITH CHECK (auth.uid() = user_id);
