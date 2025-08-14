import React from 'react';
import { openRealtorEmail } from '../../utils/emailUtils';

export function EmailTestButton() {
  const testEmail = () => {
    console.log('Testing email functionality...');
    
    // Test with simple mailto first
    const testRealtorEmail = 'test@example.com';
    const testRealtorName = 'Test Realtor';
    const testCompanyName = 'Test Company';
    
    try {
      openRealtorEmail(testRealtorEmail, testRealtorName, testCompanyName);
    } catch (error) {
      console.error('Test failed:', error);
      alert('Email test failed: ' + error);
    }
  };

  const simpleMailtoTest = () => {
    console.log('Testing simple mailto...');
    window.location.href = 'mailto:test@example.com?subject=Test&body=This is a test';
  };

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="text-lg font-bold mb-2">Email Function Test</h3>
      <div className="space-x-2">
        <button 
          onClick={testEmail}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Full Email Function
        </button>
        <button 
          onClick={simpleMailtoTest}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Test Simple Mailto
        </button>
      </div>
    </div>
  );
}
