import { diagnosticService } from '../src/services/diagnosticService';

async function diagnoseSupabase() {
  try {
    console.log('🔍 Starting Supabase diagnostic checks...');
    
    // Test the connection
    console.log('\n📊 Testing Supabase connection...');
    const connectionResult = await diagnosticService.testSupabaseConnection();
    if (connectionResult.success) {
      console.log('✅ Connection successful:', connectionResult.message);
    } else {
      console.error('❌ Connection failed:', connectionResult.message);
      console.error('Details:', JSON.stringify(connectionResult.details, null, 2));
    }
    
    // Check database schema
    console.log('\n📋 Checking database schema...');
    const schemaResult = await diagnosticService.checkDatabaseSchema();
    if (schemaResult.success) {
      console.log('✅ Schema check successful:', schemaResult.message);
    } else {
      console.error('❌ Schema check failed:', schemaResult.message);
    }
    
    console.log('\n📊 Table status:');
    for (const [table, exists] of Object.entries(schemaResult.tables)) {
      console.log(`${exists ? '✅' : '❌'} ${table}`);
    }
    
    console.log('\n🏁 Diagnostic completed');
    
    if (!connectionResult.success || !schemaResult.success) {
      console.log('\n⚠️ Issues were detected. Please see above for details.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error running diagnostics:', error);
    process.exit(1);
  }
}

diagnoseSupabase();
