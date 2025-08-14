# Google Maps Integration Setup Guide

This guide will help you set up Google Maps integration for the ListingUploader component to automatically geocode property addresses and display locations.

## Features Added

### 1. **Automatic Geocoding**
- Converts address + city + country into latitude/longitude coordinates
- One-click "Zoek locatie" button to find coordinates automatically
- Manual coordinate input option for precise positioning

### 2. **Google Maps Integration**
- Direct link to view property location on Google Maps
- Coordinates stored in database for future map displays
- Validation and error handling for geocoding requests

### 3. **Enhanced Property Data**
- New fields: `latitude` and `longitude` 
- Automatic database loading/saving of coordinates
- Form validation and user feedback

## Setup Instructions

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the following APIs:
   - **Geocoding API** (for address → coordinates conversion)
   - **Maps JavaScript API** (for displaying maps)
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Google Maps API key to `.env`:
   ```bash
   REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyBvOkBo0jvdMacX6xwYyyAoZhEOvYcHXBM
   ```

### Step 3: Secure Your API Key (Important!)

1. In Google Cloud Console, go to your API key
2. Click **Restrict Key**
3. Under **Application restrictions**, choose **HTTP referrers**
4. Add your domains:
   ```
   https://yourdomain.com/*
   https://www.yourdomain.com/*
   http://localhost:3000/* (for development)
   ```

5. Under **API restrictions**, select **Restrict key** and choose:
   - Geocoding API
   - Maps JavaScript API

### Step 4: Update Database Schema

Add the new coordinate fields to your `properties` table:

```sql
-- Add latitude and longitude columns to properties table
ALTER TABLE properties 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN original_price INTEGER;

-- Create index for location-based queries
CREATE INDEX idx_properties_location ON properties(latitude, longitude);
```

## How to Use

### For Users (Realtors/Admins):

1. **Fill in Address Details**:
   - Enter complete address
   - Select city and country

2. **Get Coordinates**:
   - Click "Zoek locatie" button
   - System automatically finds and fills coordinates
   - Or manually enter latitude/longitude

3. **Verify Location**:
   - Click "Bekijk op Google Maps" link
   - Verify the pin is in the correct location

### For Developers:

#### Adding Map Display Component

Create a map component to display the property location:

```tsx
// components/PropertyMap.tsx
import React from 'react';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  address: string;
}

export function PropertyMap({ latitude, longitude, address }: PropertyMapProps) {
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=${latitude},${longitude}`;
  
  return (
    <div className="w-full h-64 rounded-lg overflow-hidden">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        src={mapUrl}
        allowFullScreen
        title={`Map for ${address}`}
      />
    </div>
  );
}
```

#### Usage in Property Display:

```tsx
// In PropertyDetails.tsx or similar
{property.latitude && property.longitude && (
  <PropertyMap 
    latitude={property.latitude}
    longitude={property.longitude}
    address={property.address}
  />
)}
```

## API Costs

Google Maps pricing (as of 2024):
- **Geocoding API**: $5 per 1,000 requests (first 40,000/month free)
- **Maps JavaScript API**: $7 per 1,000 loads (first 28,000/month free)

For most real estate websites, the free tier is sufficient.

## Troubleshooting

### Common Issues:

1. **"Geocoding API error"**
   - Check API key is correct
   - Verify Geocoding API is enabled
   - Check API key restrictions

2. **"Locatie niet gevonden"**
   - Address might be incomplete
   - Try more specific address
   - Check spelling of city/country

3. **Coordinates not saving**
   - Check database schema has latitude/longitude columns
   - Verify Property type includes coordinate fields

### Testing the Integration:

1. Try these test addresses:
   - "Kaya Grandi 1, Kralendijk, Bonaire" (should work)
   - "Dam Square, Amsterdam, Nederland" (should work)
   - "Invalid Address, Nowhere" (should fail gracefully)

## Security Best Practices

1. **Never expose API key in client-side code**
2. **Always restrict API key to specific domains**
3. **Monitor API usage in Google Cloud Console**
4. **Set up billing alerts to avoid unexpected charges**

## Future Enhancements

- Interactive map for property editing
- Nearby properties search using coordinates
- Distance calculations between properties
- Neighborhood boundary detection
- Street view integration

## Support

If you encounter issues:
1. Check Google Cloud Console for API errors
2. Verify environment variables are loaded
3. Test with simple addresses first
4. Check browser network tab for API responses
