/**
 * Script to manually update phone numbers for properties
 * 
 * Usage:
 * 1. Make sure you have a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * 2. Run: node update-phone-numbers.js list
 *    (This will show all properties with their IDs)
 * 3. Edit the phoneNumberUpdates array below with your property IDs and phone numbers
 * 4. Run: node update-phone-numbers.js update
 * 
 * OR to set the same number for all properties:
 *    node update-phone-numbers.js set-all "+31201234567"
 */

require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// ========================================
// CONFIGURATION
// ========================================

// Read Supabase credentials from .env file
let SUPABASE_URL, SUPABASE_ANON_KEY;

try {
  // Try to read from .env file if it exists
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
    
    if (urlMatch) SUPABASE_URL = urlMatch[1].trim();
    if (keyMatch) SUPABASE_ANON_KEY = keyMatch[1].trim();
  }
} catch (err) {
  console.error('Error reading .env file:', err.message);
}

// Fallback to manual configuration if .env not found
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log('⚠️  .env file not found or incomplete. Using manual configuration...\n');
  
  // MANUAL CONFIGURATION - Update these if .env file doesn't exist
  SUPABASE_URL = 'YOUR_SUPABASE_URL'; // e.g., https://xxxxx.supabase.co
  SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
}

// ========================================
// PHONE NUMBER UPDATES
// ========================================
// Add your property IDs and phone numbers here
// Format: { propertyId: 'property-id-here', phoneNumber: '+31201234567' }

const phoneNumberUpdates = [
  // Example:
  // { propertyId: '123e4567-e89b-12d3-a456-426614174000', phoneNumber: '+31201234567' },
  // { propertyId: '223e4567-e89b-12d3-a456-426614174001', phoneNumber: '+31207654321' },
  
  // Add your updates here:
  
];

// ========================================
// SCRIPT FUNCTIONS
// ========================================

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function listAllProperties() {
  console.log('\n📋 Fetching all properties...\n');
  
  const { data, error } = await supabase
    .from('properties')
    .select('id, title, address, city, phone_number')
    .order('title');
    
  if (error) {
    console.error('❌ Error fetching properties:', error.message);
    return [];
  }
  
  if (!data || data.length === 0) {
    console.log('No properties found.');
    return [];
  }
  
  console.log(`Found ${data.length} properties:\n`);
  console.log('='.repeat(80));
  data.forEach((prop, index) => {
    console.log(`\n${index + 1}. ${prop.title}`);
    console.log(`   ID: ${prop.id}`);
    console.log(`   Address: ${prop.address}, ${prop.city}`);
    console.log(`   Current Phone: ${prop.phone_number || '❌ (none)'}`);
  });
  console.log('\n' + '='.repeat(80));
  console.log('\n💡 Copy the property IDs and add them to the phoneNumberUpdates array.');
  console.log('💡 Then run: node update-phone-numbers.js update\n');
  
  return data;
}

async function updatePhoneNumbers() {
  if (phoneNumberUpdates.length === 0) {
    console.log('\n⚠️  No phone number updates configured.');
    console.log('Please add updates to the phoneNumberUpdates array in this file.\n');
    console.log('Example:');
    console.log('  const phoneNumberUpdates = [');
    console.log('    { propertyId: "123e4567-e89b-12d3-a456-426614174000", phoneNumber: "+31201234567" },');
    console.log('  ];\n');
    return;
  }
  
  console.log(`\n📞 Updating ${phoneNumberUpdates.length} phone number(s)...\n`);
  console.log('='.repeat(80));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const update of phoneNumberUpdates) {
    const { propertyId, phoneNumber } = update;
    
    console.log(`\nUpdating property ${propertyId}...`);
    
    const { data, error } = await supabase
      .from('properties')
      .update({ phone_number: phoneNumber })
      .eq('id', propertyId)
      .select('title, phone_number');
      
    if (error) {
      console.error(`  ❌ Error: ${error.message}`);
      errorCount++;
    } else if (!data || data.length === 0) {
      console.error(`  ❌ Property not found with ID: ${propertyId}`);
      errorCount++;
    } else {
      console.log(`  ✅ Updated "${data[0].title}"`);
      console.log(`     Phone number: ${data[0].phone_number}`);
      successCount++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 Summary:');
  console.log(`   ✅ Successfully updated: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log('\n' + '='.repeat(80) + '\n');
}

async function updateAllPropertiesWithSameNumber(phoneNumber) {
  console.log(`\n📞 Setting phone number "${phoneNumber}" for ALL properties...\n`);
  
  const { data, error } = await supabase
    .from('properties')
    .update({ phone_number: phoneNumber })
    .neq('id', '00000000-0000-0000-0000-000000000000') // Match all
    .select('id, title');
    
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  console.log('='.repeat(80));
  console.log(`\n✅ Successfully updated ${data.length} properties with phone number: ${phoneNumber}\n`);
  
  if (data.length <= 20) {
    console.log('Updated properties:');
    data.forEach((prop, index) => {
      console.log(`  ${index + 1}. ${prop.title}`);
    });
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
}

// ========================================
// MAIN EXECUTION
// ========================================

async function main() {
  console.log('\n🏡 Property Phone Number Updater');
  console.log('='.repeat(80));
  
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.error('\n❌ Please configure your Supabase credentials first!');
    console.log('\nOption 1: Create a .env file with:');
    console.log('  VITE_SUPABASE_URL=your-url-here');
    console.log('  VITE_SUPABASE_ANON_KEY=your-key-here');
    console.log('\nOption 2: Edit this file and set SUPABASE_URL and SUPABASE_ANON_KEY\n');
    return;
  }
  
  const command = process.argv[2];
  
  if (!command || command === 'list') {
    await listAllProperties();
  } else if (command === 'update') {
    await updatePhoneNumbers();
  } else if (command === 'set-all') {
    const phoneNumber = process.argv[3];
    if (!phoneNumber) {
      console.error('\n❌ Please provide a phone number!');
      console.log('Usage: node update-phone-numbers.js set-all "+31201234567"\n');
      return;
    }
    await updateAllPropertiesWithSameNumber(phoneNumber);
  } else {
    console.log('\nUsage:');
    console.log('  node update-phone-numbers.js list         - List all properties');
    console.log('  node update-phone-numbers.js update       - Update phone numbers (configure in file)');
    console.log('  node update-phone-numbers.js set-all "phone" - Set same number for all properties\n');
  }
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  console.error(err);
});
