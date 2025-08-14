// Update migrated properties to have all required fields
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwmsihnepjvzwbrgrbdn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bXNpaG5lcGp2endicmdyYmRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDcyNjUyNywiZXhwIjoyMDcwMzAyNTI3fQ.l7i22sn2bx8jZGfHtz3V9MaigsmZC1y2fKIXUFWMZEI';

console.log('🔄 Updating Properties with Missing Fields\n');

async function updatePropertiesWithMissingFields() {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('📋 Step 1: Getting all properties...');
    
    const { data: properties, error: fetchError } = await supabase
        .from('properties')
        .select('*');
        
    if (fetchError) {
        console.log('❌ Error fetching properties:', fetchError.message);
        return;
    }
    
    console.log(`✅ Found ${properties.length} properties to update\n`);
    
    // Get admin user ID for ownership
    const { data: adminUser, error: userError } = await supabase.auth.admin.listUsers();
    let adminUserId = null;
    
    if (!userError && adminUser.users.length > 0) {
        adminUserId = adminUser.users.find(u => u.email === 's.foort@bonairemakelaars.com')?.id;
        console.log('✅ Found admin user ID:', adminUserId);
    }
    
    console.log('📤 Step 2: Updating properties...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const prop of properties) {
        try {
            console.log(`   Updating: ${prop.title}`);
            
            const updates = {
                // Copy location to city if city is empty
                city: prop.city || prop.location || 'Kralendijk',
                
                // Copy area_sqm to square_meters if needed
                square_meters: prop.square_meters || prop.area_sqm || null,
                
                // Set category to property_type if needed
                category: prop.category || prop.property_type || 'house',
                
                // Set ownership to admin user
                created_by: adminUserId,
                owner_id: adminUserId,
                listing_id: adminUserId,
                
                // Ensure postal_code exists
                postal_code: prop.postal_code || null,
                
                // Ensure original_price exists (can be same as price)
                original_price: prop.original_price || prop.price
            };
            
            const { error: updateError } = await supabase
                .from('properties')
                .update(updates)
                .eq('id', prop.id);
                
            if (updateError) {
                console.log(`   ❌ Failed: ${updateError.message}`);
                errorCount++;
            } else {
                console.log(`   ✅ Updated successfully`);
                successCount++;
            }
            
        } catch (err) {
            console.log(`   ❌ Exception: ${err.message}`);
            errorCount++;
        }
    }
    
    console.log('\n📊 Update Summary:');
    console.log(`   ✅ Successful updates: ${successCount}`);
    console.log(`   ❌ Failed updates: ${errorCount}`);
    
    console.log('\n🔍 Step 3: Verification...');
    
    // Verify the updates
    const { data: updatedProps, error: verifyError } = await supabase
        .from('properties')
        .select('id, title, city, square_meters, category, created_by, owner_id');
        
    if (verifyError) {
        console.log('❌ Verification failed:', verifyError.message);
    } else {
        console.log('✅ Properties verification:\n');
        
        updatedProps.slice(0, 5).forEach(prop => {
            console.log(`   ${prop.id}: ${prop.title}`);
            console.log(`     City: ${prop.city} | Size: ${prop.square_meters}m² | Category: ${prop.category}`);
            console.log(`     Owner: ${prop.owner_id ? 'Set' : 'Not set'}`);
        });
        
        if (updatedProps.length > 5) {
            console.log(`   ... and ${updatedProps.length - 5} more properties`);
        }
    }
    
    console.log('\n🎉 Property update complete!');
    console.log('The frontend should now be able to load properties without errors.');
}

updatePropertiesWithMissingFields().catch(console.error);
