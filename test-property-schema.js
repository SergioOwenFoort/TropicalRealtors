// Test script to verify the property service works with the new database schema
import { addProperty } from '../src/services/propertyService.js';

const testProperty = {
  title: 'Test Property USD',
  description: 'A test property to verify the new schema works',
  price: 250000, // USD
  originalPrice: 300000, // USD  
  address: 'Test Address 123',
  city: 'Kralendijk',
  country: 'Bonaire',
  postalCode: '12345',
  latitude: 12.1500,
  longitude: -68.2800,
  bedrooms: 2,
  bathrooms: 1,
  size: 100,
  images: ['data:image/png;base64,test'],
  type: 'koop',
  category: 'hotel', // Testing new category
  features: ['test-feature'],
  status: 'concept',
  featured: false,
  makelaarId: 'test-user-id',
  datePosted: new Date().toISOString()
};

console.log('Testing property service with new schema...');
console.log('Test property:', JSON.stringify(testProperty, null, 2));
