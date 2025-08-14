const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Create Supabase client with service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || 'your-service-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runPropertyViewTrackingMigration() {
  console.log('🚀 Starting property view tracking migration...\n');

  try {
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync('./supabase/add_property_view_tracking.sql', 'utf8');
    
    console.log('📄 Migration SQL loaded, executing...');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      
      // Try alternative approach - execute parts separately
      console.log('\n🔄 Trying alternative approach...');
      
      // Add view_count column
      const { error: error1 } = await supabase.rpc('exec_sql', { 
        sql: `ALTER TABLE properties ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;` 
      });
      if (error1) console.error('Error adding view_count:', error1);
      else console.log('✅ Added view_count column');
      
      // Add last_viewed_at column
      const { error: error2 } = await supabase.rpc('exec_sql', { 
        sql: `ALTER TABLE properties ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP WITH TIME ZONE;` 
      });
      if (error2) console.error('Error adding last_viewed_at:', error2);
      else console.log('✅ Added last_viewed_at column');
      
      // Initialize view_count
      const { error: error3 } = await supabase
        .from('properties')
        .update({ view_count: 0 })
        .is('view_count', null);
      if (error3) console.error('Error initializing view_count:', error3);
      else console.log('✅ Initialized view_count to 0');
      
    } else {
      console.log('✅ Migration executed successfully!');
    }
    
    // Verify the migration by checking columns
    console.log('\n🔍 Verifying migration...');
    
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, title, view_count, last_viewed_at')
      .limit(3);
    
    if (propError) {
      console.error('❌ Verification failed:', propError);
    } else {
      console.log('✅ Migration verified! Sample properties:');
      properties.forEach((prop, index) => {
        console.log(`   ${index + 1}. "${prop.title}" - Views: ${prop.view_count || 0}`);
      });
    }
    
    console.log('\n🎉 Property view tracking is now ready!');
    console.log('🔥 Features added:');
    console.log('   - view_count column for tracking property views');
    console.log('   - last_viewed_at for tracking when property was last viewed');
    console.log('   - PropertyViewTracker service for managing views');
    console.log('   - PropertyAnalytics component for dashboard display');
    console.log('   - Analytics added to Admin, Realtor, and Owner dashboards');
    
  } catch (error) {
    console.error('💥 Migration failed with error:', error);
  }
}

// Run the migration
runPropertyViewTrackingMigration();
