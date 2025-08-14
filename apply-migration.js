import { createClient } from '@supabase/supabase-js';

// Use your Supabase credentials
const supabaseUrl = 'https://imhtjggudeidvmpgwjho.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyLocationMigration() {
  console.log('🔧 Applying location and price fields migration...');
  
  try {
    // Apply the migration SQL
    const migrationSQL = `
      -- Add latitude and longitude columns for Google Maps integration
      ALTER TABLE properties 
      ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
      ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

      -- Add original_price column for price comparison feature
      ALTER TABLE properties 
      ADD COLUMN IF NOT EXISTS original_price DECIMAL(12, 2);

      -- Create index for location-based queries
      CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

      -- Create index for price comparison queries
      CREATE INDEX IF NOT EXISTS idx_properties_price_comparison ON properties(price, original_price) WHERE original_price IS NOT NULL;
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('❌ Migration failed:', error);
      
      // Try alternative approach - run individual ALTER statements
      console.log('🔄 Trying individual column additions...');
      
      const alterCommands = [
        'ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);',
        'ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);',
        'ALTER TABLE properties ADD COLUMN IF NOT EXISTS original_price DECIMAL(12, 2);'
      ];

      for (const command of alterCommands) {
        try {
          console.log(`Running: ${command}`);
          const { error: cmdError } = await supabase.rpc('exec_sql', { sql: command });
          if (cmdError) {
            console.error(`❌ Failed: ${command}`, cmdError);
          } else {
            console.log(`✅ Success: ${command}`);
          }
        } catch (err) {
          console.error(`❌ Error with: ${command}`, err);
        }
      }
    } else {
      console.log('✅ Migration applied successfully');
    }

    // Verify the columns were added
    console.log('🔍 Verifying migration...');
    const { data: testData, error: testError } = await supabase
      .from('properties')
      .select('latitude, longitude, original_price')
      .limit(1);

    if (testError) {
      console.error('❌ Verification failed:', testError.message);
    } else {
      console.log('✅ Verification successful - columns are accessible');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

applyLocationMigration();
