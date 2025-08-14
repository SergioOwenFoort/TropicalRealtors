// Corrected Property Data Import Script
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://pwmsihnepjvzwbrgrbdn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bXNpaG5lcGp2endicmdyYmRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDcyNjUyNywiZXhwIjoyMDcwMzAyNTI3fQ.l7i22sn2bx8jZGfHtz3V9MaigsmZC1y2fKIXUFWMZEI';

console.log('🚀 Corrected Property Data Import\n');

async function importCorrectedPropertyData() {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('📋 Step 1: Clearing existing data and re-importing...');
    
    // Clear existing data first
    try {
        const { error: deleteError } = await supabase
            .from('properties')
            .delete()
            .neq('id', 0); // Delete all records
            
        if (deleteError) {
            console.log('⚠️  Could not clear existing data:', deleteError.message);
        } else {
            console.log('✅ Cleared existing data');
        }
    } catch (err) {
        console.log('⚠️  Clear data exception:', err.message);
    }
    
    // Read and parse CSV correctly
    let csvData;
    try {
        csvData = fs.readFileSync('test-properties.csv', 'utf8');
        console.log('✅ CSV file read successfully');
    } catch (err) {
        console.log('❌ Error reading CSV file:', err.message);
        return;
    }
    
    // Parse CSV properly
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    console.log('📊 CSV Headers:', headers);
    console.log('📏 Data rows:', lines.length - 1);
    
    const properties = [];
    
    // Parse each property correctly
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        // Split by comma, but handle quoted fields
        const values = [];
        let currentValue = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue.trim());
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim());
        
        // Map values to correct fields based on actual CSV structure
        const property = {
            title: values[0] || 'Untitled Property',                    // title
            price: parseFloat(values[1]) || 0,                          // price  
            address: values[2] || '',                                   // address
            location: values[3] || '',                                  // city
            property_type: values[5] || 'house',                        // category (huizen, appartementen)
            status: values[8] === 'koop' ? 'for_sale' : 
                   values[8] === 'huur' ? 'for_rent' : 'available',     // type (koop/huur)
            description: values[6]?.replace(/"/g, '') || '',            // description (remove quotes)
            area_sqm: parseFloat(values[9]) || null,                    // size
            bedrooms: null, // Not in this CSV
            bathrooms: null, // Not in this CSV
            images: values[7] ? values[7].split('|').map(img => img.trim()) : [], // images (split by |)
            features: [],
            contact_info: {
                country: values[4] || 'bonaire'                         // country
            },
            is_featured: false,
            view_count: 0
        };
        
        properties.push(property);
    }
    
    console.log(`✅ Parsed ${properties.length} properties correctly\n`);
    
    // Display sample property
    if (properties.length > 0) {
        console.log('📝 Sample property (corrected):');
        console.log(JSON.stringify(properties[0], null, 2));
        console.log('');
    }
    
    console.log('📤 Step 2: Importing corrected properties...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        
        try {
            console.log(`   Importing ${i + 1}/${properties.length}: ${property.title}`);
            console.log(`     Price: €${property.price} | Type: ${property.property_type} | Status: ${property.status}`);
            
            const { data, error } = await supabase
                .from('properties')
                .insert([property])
                .select();
                
            if (error) {
                console.log(`   ❌ Failed: ${error.message}`);
                errorCount++;
            } else {
                console.log(`   ✅ Success: ID ${data[0]?.id}`);
                successCount++;
                
                // Insert images if available
                if (property.images.length > 0) {
                    const propertyId = data[0].id;
                    const imageInserts = property.images.map((url, index) => ({
                        property_id: propertyId,
                        url: url,
                        alt_text: `${property.title} - Image ${index + 1}`,
                        is_primary: index === 0,
                        sort_order: index
                    }));
                    
                    const { error: imgError } = await supabase
                        .from('property_images')
                        .insert(imageInserts);
                        
                    if (imgError) {
                        console.log(`   ⚠️  Images failed: ${imgError.message}`);
                    } else {
                        console.log(`   ✅ ${imageInserts.length} images added`);
                    }
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
        } catch (err) {
            console.log(`   ❌ Exception: ${err.message}`);
            errorCount++;
        }
    }
    
    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Successful imports: ${successCount}`);
    console.log(`   ❌ Failed imports: ${errorCount}`);
    console.log(`   📋 Total processed: ${properties.length}`);
    
    // Final verification
    console.log('\n🔍 Step 3: Final verification...');
    
    try {
        const { data: allProperties, error: verifyError } = await supabase
            .from('properties')
            .select('id, title, price, property_type, status, location');
            
        if (verifyError) {
            console.log('❌ Verification failed:', verifyError.message);
        } else {
            console.log(`✅ Final count: ${allProperties.length} properties in database\n`);
            
            console.log('📋 All imported properties:');
            allProperties.forEach(prop => {
                console.log(`   ${prop.id}: ${prop.title} - €${prop.price} (${prop.property_type}, ${prop.status})`);
            });
        }
    } catch (err) {
        console.log('❌ Verification exception:', err.message);
    }
    
    console.log('\n🎉 Corrected import complete!');
    console.log('\nNext steps:');
    console.log('1. Create admin user: Go to Supabase Dashboard > Authentication > Users > Add User');
    console.log('2. Test website: npm run dev');
    console.log('3. Check if properties display correctly');
}

importCorrectedPropertyData().catch(console.error);
