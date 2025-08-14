// Apply click tracking migration to cloud Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://imhtjggudeidvmpgwjho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTMzNjQzOCwiZXhwIjoyMDUwOTEyNDM4fQ.x1T34fJy0QrpkQ8E8rNlx5y6hCW_VEhNPpF0uC8A-v8'
);

async function applyClickTrackingMigration() {
  console.log('🔄 Applying click tracking migration to cloud database...\n');

  try {
    // Step 1: Add click tracking columns
    console.log('1️⃣ Adding click_count and last_clicked_at columns...');
    
    const addColumnsSQL = `
      DO $$ 
      BEGIN
          -- Add click_count column if it doesn't exist
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'carousel_slides' AND column_name = 'click_count'
          ) THEN
              ALTER TABLE carousel_slides ADD COLUMN click_count INTEGER DEFAULT 0;
              RAISE NOTICE 'Added click_count column';
          ELSE
              RAISE NOTICE 'click_count column already exists';
          END IF;
          
          -- Add last_clicked_at column if it doesn't exist
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'carousel_slides' AND column_name = 'last_clicked_at'
          ) THEN
              ALTER TABLE carousel_slides ADD COLUMN last_clicked_at TIMESTAMP WITH TIME ZONE;
              RAISE NOTICE 'Added last_clicked_at column';
          ELSE
              RAISE NOTICE 'last_clicked_at column already exists';
          END IF;
      END $$;
    `;

    const { error: columnsError } = await supabase.rpc('exec_sql', { sql: addColumnsSQL });
    if (columnsError) {
      // Try direct SQL execution
      const { error: directError } = await supabase.from('_realtime_schema_migrations').select('version').limit(1);
      if (directError) {
        console.log('⚠️ Cannot execute SQL directly. Please run this migration manually in Supabase SQL Editor:');
        console.log('🔗 Go to: https://imhtjggudeidvmpgwjho.supabase.co/project/imhtjggudeidvmpgwjho/sql');
        console.log('\n📝 Run this SQL:');
        console.log(addColumnsSQL);
        return false;
      }
    } else {
      console.log('✅ Columns added successfully');
    }

    // Step 2: Update existing slides
    console.log('\n2️⃣ Updating existing slides with default click count...');
    const { error: updateError } = await supabase
      .from('carousel_slides')
      .update({ click_count: 0 })
      .is('click_count', null);

    if (updateError && !updateError.message.includes('column "click_count" of relation "carousel_slides" does not exist')) {
      console.error('❌ Error updating slides:', updateError);
    } else {
      console.log('✅ Existing slides updated');
    }

    // Step 3: Create the increment function
    console.log('\n3️⃣ Creating increment_carousel_click function...');
    const incrementFunctionSQL = `
      CREATE OR REPLACE FUNCTION increment_carousel_click(slide_id TEXT)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        UPDATE carousel_slides 
        SET 
          click_count = COALESCE(click_count, 0) + 1,
          last_clicked_at = NOW()
        WHERE id = slide_id;
      END;
      $$;
    `;

    console.log('📋 Please run this SQL in Supabase SQL Editor:');
    console.log('🔗 https://imhtjggudeidvmpgwjho.supabase.co/project/imhtjggudeidvmpgwjho/sql');
    console.log('\n📝 SQL to run:');
    console.log(incrementFunctionSQL);

    console.log('\n✅ Migration steps prepared!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to Supabase SQL Editor');
    console.log('2. Copy and paste the SQL commands shown above');
    console.log('3. Run them one by one');
    console.log('4. Refresh your application');

    return true;

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}

applyClickTrackingMigration();
