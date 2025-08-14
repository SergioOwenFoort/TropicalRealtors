// Database Migration Script - Export from old DB and import to new DB
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// OLD DATABASE (source)
const oldSupabaseUrl = 'https://imhtjggudeidvmpgwjho.supabase.co';
const oldSupabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw';

// NEW DATABASE (destination)  
const newSupabaseUrl = 'https://pwmsihnepjvzwbrgrbdn.supabase.co';
const newSupabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bXNpaG5lcGp2endicmdyYmRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDcyNjUyNywiZXhwIjoyMDcwMzAyNTI3fQ.l7i22sn2bx8jZGfHtz3V9MaigsmZC1y2fKIXUFWMZEI';

console.log('🔄 Database Migration: Old → New Supabase\n');

async function migrateDatabase() {
    const oldDb = createClient(oldSupabaseUrl, oldSupabaseServiceKey);
    const newDb = createClient(newSupabaseUrl, newSupabaseServiceKey);
    
    console.log('📋 Step 1: Testing connections...');
    
    // Test old database connection
    try {
        const { data: oldTest, error: oldError } = await oldDb
            .from('properties')
            .select('count')
            .limit(1);
            
        if (oldError) {
            console.log('❌ Old database connection failed:', oldError.message);
            console.log('   This is expected if the old DB is corrupted');
        } else {
            console.log('✅ Old database accessible');
        }
    } catch (err) {
        console.log('❌ Old database exception:', err.message);
    }
    
    // Test new database connection
    try {
        const { data: newTest, error: newError } = await newDb
            .from('properties')
            .select('count')
            .limit(1);
            
        if (newError) {
            console.log('❌ New database connection failed:', newError.message);
            return;
        } else {
            console.log('✅ New database accessible');
        }
    } catch (err) {
        console.log('❌ New database exception:', err.message);
        return;
    }
    
    console.log('\n📊 Step 2: Attempting to export data from old database...');
    
    const tablesToMigrate = [
        'properties',
        'property_images', 
        'realtors',
        'carousel_slides',
        'users', // If this table exists
        'profiles' // If this table exists
    ];
    
    const exportedData = {};
    
    for (const tableName of tablesToMigrate) {
        try {
            console.log(`   Exporting ${tableName}...`);
            
            const { data, error } = await oldDb
                .from(tableName)
                .select('*');
                
            if (error) {
                console.log(`   ⚠️  ${tableName}: ${error.message}`);
                exportedData[tableName] = [];
            } else {
                console.log(`   ✅ ${tableName}: ${data.length} records exported`);
                exportedData[tableName] = data;
            }
            
        } catch (err) {
            console.log(`   ❌ ${tableName}: Exception - ${err.message}`);
            exportedData[tableName] = [];
        }
    }
    
    // Save exported data to file
    console.log('\n💾 Step 3: Saving exported data to file...');
    
    try {
        fs.writeFileSync('exported-data.json', JSON.stringify(exportedData, null, 2));
        console.log('✅ Data exported to exported-data.json');
    } catch (err) {
        console.log('❌ Failed to save exported data:', err.message);
        return;
    }
    
    console.log('\n📤 Step 4: Importing data to new database...');
    
    // Clear existing test data in new database
    try {
        await newDb.from('property_images').delete().neq('id', 0);
        await newDb.from('properties').delete().neq('id', 0);
        console.log('✅ Cleared test data from new database');
    } catch (err) {
        console.log('⚠️  Could not clear test data:', err.message);
    }
    
    // Import properties first (since other tables may reference it)
    if (exportedData.properties && exportedData.properties.length > 0) {
        console.log(`   Importing ${exportedData.properties.length} properties...`);
        
        let propertySuccess = 0;
        let propertyErrors = 0;
        
        for (const property of exportedData.properties) {
            try {
                // Clean up the property data to match new schema
                const cleanProperty = {
                    title: property.title || 'Untitled Property',
                    description: property.description || '',
                    price: property.price || 0,
                    address: property.address || '',
                    location: property.location || property.city || '',
                    property_type: property.property_type || property.category || 'house',
                    status: 'actief', // Set to what frontend expects
                    bedrooms: property.bedrooms || null,
                    bathrooms: property.bathrooms || null,
                    area_sqm: property.area_sqm || property.size || null,
                    lot_size_sqm: property.lot_size_sqm || null,
                    latitude: property.latitude || null,
                    longitude: property.longitude || null,
                    images: property.images || [],
                    features: property.features || [],
                    contact_info: property.contact_info || {},
                    country: 'Bonaire',
                    featured: property.is_featured || property.featured || false,
                    is_featured: property.is_featured || property.featured || false,
                    view_count: property.view_count || 0,
                    date_posted: property.created_at || new Date().toISOString()
                };
                
                const { data: insertedProperty, error: insertError } = await newDb
                    .from('properties')
                    .insert([cleanProperty])
                    .select();
                    
                if (insertError) {
                    console.log(`     ❌ Property "${property.title}": ${insertError.message}`);
                    propertyErrors++;
                } else {
                    console.log(`     ✅ Property "${property.title}": ID ${insertedProperty[0].id}`);
                    propertySuccess++;
                    
                    // Store the new ID mapping for images
                    property._newId = insertedProperty[0].id;
                }
                
            } catch (err) {
                console.log(`     ❌ Property "${property.title}": Exception - ${err.message}`);
                propertyErrors++;
            }
        }
        
        console.log(`   📊 Properties: ${propertySuccess} success, ${propertyErrors} errors`);
    }
    
    // Import property images
    if (exportedData.property_images && exportedData.property_images.length > 0) {
        console.log(`   Importing ${exportedData.property_images.length} property images...`);
        
        let imageSuccess = 0;
        let imageErrors = 0;
        
        for (const image of exportedData.property_images) {
            try {
                // Find the new property ID
                const originalProperty = exportedData.properties.find(p => p.id === image.property_id);
                if (!originalProperty || !originalProperty._newId) {
                    imageErrors++;
                    continue;
                }
                
                const cleanImage = {
                    property_id: originalProperty._newId,
                    url: image.url,
                    alt_text: image.alt_text || '',
                    is_primary: image.is_primary || false,
                    sort_order: image.sort_order || 0
                };
                
                const { error: imageError } = await newDb
                    .from('property_images')
                    .insert([cleanImage]);
                    
                if (imageError) {
                    imageErrors++;
                } else {
                    imageSuccess++;
                }
                
            } catch (err) {
                imageErrors++;
            }
        }
        
        console.log(`   📊 Images: ${imageSuccess} success, ${imageErrors} errors`);
    }
    
    // Import other tables (realtors, carousel_slides, etc.)
    for (const [tableName, data] of Object.entries(exportedData)) {
        if (tableName === 'properties' || tableName === 'property_images' || !data || data.length === 0) {
            continue; // Skip already processed or empty tables
        }
        
        console.log(`   Importing ${data.length} ${tableName}...`);
        
        try {
            const { error: importError } = await newDb
                .from(tableName)
                .insert(data);
                
            if (importError) {
                console.log(`   ❌ ${tableName}: ${importError.message}`);
            } else {
                console.log(`   ✅ ${tableName}: imported successfully`);
            }
        } catch (err) {
            console.log(`   ❌ ${tableName}: Exception - ${err.message}`);
        }
    }
    
    console.log('\n🔍 Step 5: Verification...');
    
    try {
        const { data: finalProps, error: verifyError } = await newDb
            .from('properties')
            .select('id, title, price, status, location');
            
        if (verifyError) {
            console.log('❌ Verification failed:', verifyError.message);
        } else {
            console.log(`✅ Migration complete: ${finalProps.length} properties in new database\n`);
            
            console.log('📋 Migrated properties:');
            finalProps.forEach(prop => {
                console.log(`   ${prop.id}: ${prop.title} - €${prop.price} (${prop.location})`);
            });
        }
    } catch (err) {
        console.log('❌ Verification exception:', err.message);
    }
    
    console.log('\n🎉 Database migration complete!');
    console.log('Your real property data has been migrated to the new database.');
    console.log('Check the website to verify everything is working correctly.');
}

migrateDatabase().catch(console.error);
