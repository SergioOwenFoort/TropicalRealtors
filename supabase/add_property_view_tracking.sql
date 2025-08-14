-- Add view tracking columns to properties table
-- Similar to carousel_slides click tracking

-- Add view_count column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'view_count'
    ) THEN
        ALTER TABLE properties ADD COLUMN view_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added view_count column';
    ELSE
        RAISE NOTICE 'view_count column already exists';
    END IF;
END $$;

-- Add last_viewed_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'last_viewed_at'        npm run dev -- --host
    ) THEN
        ALTER TABLE properties ADD COLUMN last_viewed_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added last_viewed_at column';
    ELSE
        RAISE NOTICE 'last_viewed_at column already exists';
    END IF;
END $$;

-- Initialize view_count to 0 for existing properties
UPDATE properties 
SET view_count = 0 
WHERE view_count IS NULL;

-- Create index for better performance on view_count queries
CREATE INDEX IF NOT EXISTS idx_properties_view_count 
ON properties(view_count DESC);

-- Create index for last_viewed_at
CREATE INDEX IF NOT EXISTS idx_properties_last_viewed_at 
ON properties(last_viewed_at DESC);

-- Create or replace the RPC function for incrementing property views
CREATE OR REPLACE FUNCTION increment_property_view_count(property_id UUID)
RETURNS JSON AS $$
DECLARE
    result_row RECORD;
BEGIN
    UPDATE properties SET
        view_count = COALESCE(view_count, 0) + 1,
        last_viewed_at = NOW()
    WHERE id = property_id
    RETURNING 
        id, 
        title, 
        view_count, 
        last_viewed_at 
    INTO result_row;
    
    IF result_row.id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Property not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'id', result_row.id,
        'title', result_row.title,
        'view_count', result_row.view_count,
        'last_viewed_at', result_row.last_viewed_at
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_property_view_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_property_view_count(UUID) TO anon;

-- Verify the migration
DO $$
BEGIN
    -- Check if both columns exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name IN ('view_count', 'last_viewed_at')
        GROUP BY table_name
        HAVING COUNT(*) = 2
    ) THEN
        RAISE NOTICE '✅ Property view tracking migration completed successfully!';
        RAISE NOTICE 'Added columns: view_count, last_viewed_at';
        RAISE NOTICE 'Created function: increment_property_view_count()';
        RAISE NOTICE 'Created indexes for performance';
    ELSE
        RAISE NOTICE '❌ Migration may have failed - please check manually';
    END IF;
END $$;
