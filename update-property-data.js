// Update existing property data to match frontend expectations
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwmsihnepjvzwbrgrbdn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bXNpaG5lcGp2endicmdyYmRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDcyNjUyNywiZXhwIjoyMDcwMzAyNTI3fQ.l7i22sn2bx8jZGfHtz3V9MaigsmZC1y2fKIXUFWMZEI';

console.log('🔄 Updating Property Data for Frontend Compatibility\n');

async function updatePropertyData() {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('📋 Step 1: Checking current properties...');
    
    // Get current properties
    const { data: currentProps, error: fetchError } = await supabase
        .from('properties')
        .select('*');
        
    if (fetchError) {
        console.log('❌ Error fetching properties:', fetchError.message);
        return;
    }
    
    console.log(`✅ Found ${currentProps.length} properties to update\n`);
    
    console.log('📤 Step 2: Updating properties for frontend compatibility...');
    
    for (const prop of currentProps) {
        try {
            console.log(`   Updating: ${prop.title}`);
            
            // Update the property with frontend-compatible values
            const updates = {
                status: 'actief', // Frontend expects 'actief' instead of 'for_sale'
                country: 'Bonaire',
                featured: prop.is_featured || false,
                date_posted: prop.created_at || new Date().toISOString()
            };
            
            const { error: updateError } = await supabase
                .from('properties')
                .update(updates)
                .eq('id', prop.id);
                
            if (updateError) {
                console.log(`   ❌ Failed: ${updateError.message}`);
            } else {
                console.log(`   ✅ Updated successfully`);
            }
            
        } catch (err) {
            console.log(`   ❌ Exception: ${err.message}`);
        }
    }
    
    console.log('\n📊 Step 3: Verification...');
    
    // Verify the updates
    const { data: updatedProps, error: verifyError } = await supabase
        .from('properties')
        .select('id, title, status, country, featured, date_posted');
        
    if (verifyError) {
        console.log('❌ Verification failed:', verifyError.message);
    } else {
        console.log('✅ Properties updated successfully:\n');
        
        updatedProps.forEach(prop => {
            console.log(`   ${prop.id}: ${prop.title}`);
            console.log(`     Status: ${prop.status} | Country: ${prop.country} | Featured: ${prop.featured}`);
        });
    }
    
    console.log('\n🎉 Property data update complete!');
    console.log('Frontend should now be able to load properties correctly.');
}

updatePropertyData().catch(console.error);
