-- Add unique_id and created_by fields to carousel_slides table
ALTER TABLE carousel_slides 
ADD COLUMN IF NOT EXISTS unique_id TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Create a function to generate unique IDs for carousel slides
CREATE OR REPLACE FUNCTION generate_carousel_unique_id() 
RETURNS TEXT AS $$
BEGIN
  RETURN 'CS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0') || '-' || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically set unique_id and created_by on insert
CREATE OR REPLACE FUNCTION set_carousel_slide_defaults()
RETURNS TRIGGER AS $$
BEGIN
  -- Set unique_id if not provided
  IF NEW.unique_id IS NULL THEN
    NEW.unique_id := generate_carousel_unique_id();
  END IF;
  
  -- Set created_by if not provided (use current user)
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS set_carousel_slide_defaults_trigger ON carousel_slides;
CREATE TRIGGER set_carousel_slide_defaults_trigger
  BEFORE INSERT ON carousel_slides
  FOR EACH ROW
  EXECUTE FUNCTION set_carousel_slide_defaults();

-- Update existing carousel slides to have unique IDs
UPDATE carousel_slides 
SET unique_id = generate_carousel_unique_id(),
    created_by = (SELECT id FROM auth.users WHERE email = 's.admin@bonairemakelaars.com' LIMIT 1)
WHERE unique_id IS NULL;

-- Create an index on unique_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_carousel_slides_unique_id ON carousel_slides(unique_id);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_created_by ON carousel_slides(created_by);

-- Add RLS policies for carousel slides based on user roles
CREATE POLICY "Users can view active carousel slides" ON carousel_slides
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all carousel slides" ON carousel_slides
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Realtors can manage their own carousel slides" ON carousel_slides
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'realtor'
    AND (created_by = auth.uid() OR created_by IS NULL)
  )
);

CREATE POLICY "Owners can manage their own carousel slides" ON carousel_slides
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'owner'
    AND (created_by = auth.uid() OR created_by IS NULL)
  )
);

-- Enable RLS if not already enabled
ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;
