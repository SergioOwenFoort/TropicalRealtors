// Property Data Import Script for New Supabase Database
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://pwmsihnepjvzwbrgrbdn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bXNpaG5lcGp2endicmdyYmRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDcyNjUyNywiZXhwIjoyMDcwMzAyNTI3fQ.l7i22sn2bx8jZGfHtz3V9MaigsmZC1y2fKIXUFWMZEI';

console.log('🚀 Starting Property Data Import\n');

async function importPropertyData() {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('📋 Step 1: Reading CSV data...');
    
    // Read the CSV file
    let csvData;
    try {
        csvData = fs.readFileSync('test-properties.csv', 'utf8');
        console.log('✅ CSV file read successfully');
    } catch (err) {
        console.log('❌ Error reading CSV file:', err.message);
        return;
    }
    
    // Parse CSV data
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    console.log('📊 CSV Headers:', headers);
    console.log('📏 Total rows (including header):', lines.length);
    
    const properties = [];
    
    // Parse each property
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        // Parse CSV line (handle quoted fields)
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
        values.push(currentValue.trim()); // Add the last value
        
        // Create property object
        const property = {
            title: values[0] || '',
            description: values[1] || '',
            price: parseFloat(values[2]) || null,
            address: values[3] || '',
            location: values[4] || '', // city
            property_type: values[9] || 'house', // type
            status: values[11] === 'actief' ? 'available' : values[11] || 'available',
            bedrooms: parseInt(values[6]) || null,
            bathrooms: parseInt(values[7]) || null,
            area_sqm: parseFloat(values[8]) || null,
            images: values[12] ? values[12].split(',').map(img => img.trim()) : [],
            features: [],
            contact_info: {
                country: values[5] || 'bonaire'
            },
            is_featured: false,
            view_count: 0
        };
        
        properties.push(property);
    }
    
    console.log(`✅ Parsed ${properties.length} properties\n`);
    
    // Display sample property
    if (properties.length > 0) {
        console.log('📝 Sample property:');
        console.log(JSON.stringify(properties[0], null, 2));
        console.log('');
    }
    
    console.log('🔍 Step 2: Testing database connection...');
    
    // Test connection
    try {
        const { data: testData, error: testError } = await supabase
            .from('properties')
            .select('count')
            .limit(1);
            
        if (testError) {
            console.log('❌ Database connection failed:', testError.message);
            console.log('⚠️  Please run the SQL schema setup first!');
            console.log('   1. Go to your Supabase Dashboard');
            console.log('   2. Navigate to SQL Editor');
            console.log('   3. Run the SQL from supabase-schema-setup.sql');
            return;
        } else {
            console.log('✅ Database connection successful');
        }
    } catch (err) {
        console.log('❌ Database test exception:', err.message);
        return;
    }
    
    console.log('📤 Step 3: Importing properties...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        
        try {
            console.log(`   Importing ${i + 1}/${properties.length}: ${property.title}`);
            
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
                
                // If property has images, insert them into property_images table
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
            
            // Small delay to avoid overwhelming the database
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
    
    // Verify imported data
    console.log('\n🔍 Step 4: Verifying imported data...');
    
    try {
        const { data: allProperties, error: verifyError } = await supabase
            .from('properties')
            .select('*');
            
        if (verifyError) {
            console.log('❌ Verification failed:', verifyError.message);
        } else {
            console.log(`✅ Verification successful: ${allProperties.length} properties in database`);
            
            // Show breakdown by location
            const locationCounts = {};
            allProperties.forEach(prop => {
                locationCounts[prop.location] = (locationCounts[prop.location] || 0) + 1;
            });
            
            console.log('\n📍 Properties by location:');
            Object.entries(locationCounts).forEach(([location, count]) => {
                console.log(`   ${location}: ${count} properties`);
            });
        }
    } catch (err) {
        console.log('❌ Verification exception:', err.message);
    }
    
    console.log('\n🎉 Import complete!');
    console.log('Next steps:');
    console.log('1. Create an admin user in Supabase Dashboard > Authentication');
    console.log('2. Test the website with: npm run dev');
    console.log('3. Verify properties are showing up correctly');
}

importPropertyData().catch(console.error);
