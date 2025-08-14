// Test connection to new Supabase database
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwmsihnepjvzwbrgrbdn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bXNpaG5lcGp2endicmdyYmRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDcyNjUyNywiZXhwIjoyMDcwMzAyNTI3fQ.l7i22sn2bx8jZGfHtz3V9MaigsmZC1y2fKIXUFWMZEI';

console.log('🔄 Testing New Supabase Database Connection\n');

async function testNewDatabase() {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('📍 New Database URL:', supabaseUrl);
    console.log('🔑 Service Key (first 20 chars):', supabaseServiceKey.substring(0, 20) + '...\n');
    
    // Test 1: Basic connection
    console.log('🔍 Test 1: Basic connection...');
    try {
        const { data, error } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .limit(5);
        
        if (error) {
            console.log('❌ Connection failed:', error.message);
        } else {
            console.log('✅ Connection successful!');
            console.log('   Available tables:', data.map(t => t.table_name).join(', '));
        }
    } catch (err) {
        console.log('❌ Connection exception:', err.message);
    }
    
    // Test 2: Auth system
    console.log('\n🔐 Test 2: Auth system...');
    try {
        const { data: users, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.log('❌ Auth system error:', authError.message);
        } else {
            console.log('✅ Auth system working!');
            console.log('   Current users:', users.users?.length || 0);
        }
    } catch (err) {
        console.log('❌ Auth exception:', err.message);
    }
    
    // Test 3: Create properties table if it doesn't exist
    console.log('\n📋 Test 3: Creating properties table...');
    
    const createPropertiesTableSQL = `
        CREATE TABLE IF NOT EXISTS properties (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(12,2),
            property_type VARCHAR(100),
            status VARCHAR(50) DEFAULT 'available',
            bedrooms INTEGER,
            bathrooms INTEGER,
            area_sqm DECIMAL(10,2),
            lot_size_sqm DECIMAL(10,2),
            location VARCHAR(255),
            address TEXT,
            latitude DECIMAL(10,8),
            longitude DECIMAL(11,8),
            images JSONB DEFAULT '[]',
            features JSONB DEFAULT '[]',
            contact_info JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_featured BOOLEAN DEFAULT FALSE,
            view_count INTEGER DEFAULT 0
        );
        
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
        CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
        CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
        CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
        CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured);
        
        -- Enable RLS
        ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
        
        -- Create policy to allow public read access
        CREATE POLICY IF NOT EXISTS "Public properties are viewable by everyone" 
            ON properties FOR SELECT 
            USING (true);
            
        -- Create policy to allow authenticated users to manage properties
        CREATE POLICY IF NOT EXISTS "Authenticated users can manage properties" 
            ON properties FOR ALL 
            USING (auth.uid() IS NOT NULL);
    `;
    
    try {
        const { data, error } = await supabase.rpc('exec_sql', { 
            query: createPropertiesTableSQL 
        });
        
        if (error) {
            console.log('⚠️  RPC exec_sql not available, trying alternative...');
            
            // Alternative: Try creating table directly
            const { data: altData, error: altError } = await supabase
                .from('properties')
                .select('count')
                .limit(1);
                
            if (altError && altError.message.includes('does not exist')) {
                console.log('❌ Properties table does not exist');
                console.log('   Please create it manually via Supabase Dashboard SQL Editor');
                console.log('   SQL script will be provided below');
            } else if (altError) {
                console.log('❌ Properties table error:', altError.message);
            } else {
                console.log('✅ Properties table already exists');
            }
        } else {
            console.log('✅ Properties table created successfully');
        }
    } catch (err) {
        console.log('❌ Table creation exception:', err.message);
    }
    
    // Test 4: Check for existing data
    console.log('\n📊 Test 4: Checking for existing data...');
    try {
        const { data: existingProps, error: propsError } = await supabase
            .from('properties')
            .select('count');
            
        if (propsError) {
            console.log('❌ Cannot count properties:', propsError.message);
        } else {
            console.log('✅ Properties table accessible');
            console.log('   Current properties count:', existingProps.length);
        }
    } catch (err) {
        console.log('❌ Data check exception:', err.message);
    }
    
    console.log('\n🎯 Summary:');
    console.log('1. If connection works: ✅ Database is ready');
    console.log('2. If auth works: ✅ Authentication system is healthy');
    console.log('3. If properties table exists: ✅ Ready for data import');
    console.log('4. Next step: Import property data from CSV or previous database');
}

testNewDatabase().catch(console.error);
