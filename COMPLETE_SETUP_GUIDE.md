# Complete Setup Guide for Enhanced Listing Features

This guide walks you through setting up all the enhanced features for the listing uploader and preview system.

## 🗺️ Google Maps Integration

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Geocoding API** (for address → coordinates conversion)
   - **Maps JavaScript API** (for displaying interactive maps)
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env` if you haven't already:
   ```bash
   cp .env.example .env
   ```

2. Add your Google Maps API key to `.env`:
   ```bash
   REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

### Step 3: Secure Your API Key

1. In Google Cloud Console, go to your API key
2. Click **Restrict Key**
3. Under **Application restrictions**, choose **HTTP referrers**
4. Add your domain restrictions:
   ```
   localhost:3000/*
   localhost:5173/*
   your-domain.com/*
   *.your-domain.com/*
   ```

## 🗄️ Database Setup

### Step 1: Run Database Migration

Execute the migration script in your Supabase SQL editor:

```sql
-- Copy and run the contents of supabase/add_location_and_price_fields.sql
```

Or run it directly if you have the Supabase CLI:

```bash
supabase db push
```

### Step 2: Verify Database Changes

Check that the following columns were added to your `properties` table:
- `latitude` (DECIMAL(10,8))
- `longitude` (DECIMAL(11,8))
- `original_price` (DECIMAL(12,2))

### Step 3: Update RLS Policies (if needed)

If you have Row Level Security enabled, make sure your policies include the new fields:

```sql
-- Example policy update
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON properties;
CREATE POLICY "Properties are viewable by everyone" 
ON properties FOR SELECT 
USING (true);
```

## 🎨 Frontend Features

### ✅ What's Already Implemented

1. **Google Maps Integration**
   - Automatic geocoding from address/city/country
   - Interactive map preview in both listing form and preview
   - Manual coordinate entry
   - Google Maps links

2. **Enhanced Pricing**
   - Original price field for showing discounts
   - Automatic discount percentage calculation
   - Price comparison warnings

3. **Improved UI/UX**
   - Drag-and-drop image upload
   - Auto-save functionality
   - Progress indicators
   - Enhanced form validation

4. **Property Categories**
   - Added "hotel" and "resort" categories
   - Updated all type definitions

### 🔧 How to Use

#### Adding Location to Properties

1. Fill in the property address, city, and country
2. Click "Zoek locatie" to automatically geocode
3. The map preview will show the location
4. Optionally adjust coordinates manually

#### Using Original Price

1. Add the current price as usual
2. If the property was reduced, add the original price
3. The system will show the discount percentage
4. Preview will display the price reduction

#### Image Upload

1. Drag and drop images or click to select
2. Auto-enhancement can be enabled/disabled
3. First image becomes the main photo
4. Up to 10MB per image supported

## 🚀 Testing the Integration

### Test Google Maps

1. Create a new listing
2. Add address: "Kaya Grandi 1, Kralendijk, Bonaire"
3. Click "Zoek locatie"
4. Verify coordinates are filled and map shows

### Test Database Integration

1. Create a listing with location and original price
2. Save the listing
3. Edit the listing to verify data persistence
4. Check the database to confirm fields are saved

### Test Preview

1. Fill out a complete form
2. Click "Preview" button
3. Verify map preview shows correctly
4. Check price comparison display

## 🔍 Troubleshooting

### Maps Not Loading

1. **Check API Key**: Ensure `REACT_APP_GOOGLE_MAPS_API_KEY` is set
2. **Check Console**: Look for Google Maps API errors
3. **Check Restrictions**: Verify domain restrictions allow your site
4. **Check Billing**: Ensure billing is enabled in Google Cloud

### Geocoding Not Working

1. **Check API Permissions**: Ensure Geocoding API is enabled
2. **Check Address Format**: Try different address formats
3. **Check Network**: Ensure external API calls are allowed

### Database Errors

1. **Check Migration**: Ensure migration script ran successfully
2. **Check Permissions**: Verify your database role has necessary permissions
3. **Check Types**: Ensure TypeScript types match database schema

## 📊 Database Schema

```sql
-- Properties table schema (new fields)
ALTER TABLE properties 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN original_price DECIMAL(12, 2);

-- Indexes for performance
CREATE INDEX idx_properties_location ON properties(latitude, longitude);
CREATE INDEX idx_properties_price_comparison ON properties(price, original_price);
```

## 🎯 Next Steps

### Optional Enhancements

1. **Map Clustering**: Group nearby properties on map views
2. **Radius Search**: Allow searching within X km of a location
3. **Street View**: Add Street View integration
4. **Multiple Locations**: Support for properties with multiple locations
5. **Offline Maps**: Cache map tiles for offline viewing

### Performance Optimizations

1. **Lazy Loading**: Only load maps when needed
2. **Image Optimization**: Further compress uploaded images
3. **API Caching**: Cache geocoding results
4. **Database Indexing**: Add more indexes for location queries

## 🔐 Security Considerations

1. **API Key Security**: Never expose API keys in client-side code
2. **Rate Limiting**: Implement rate limiting for geocoding
3. **Input Validation**: Validate all location inputs
4. **CORS**: Configure proper CORS settings

---

**Need Help?**

1. Check the console for error messages
2. Review the `GOOGLE_MAPS_SETUP.md` file
3. Verify your `.env` configuration
4. Test with simple addresses first

All features are now fully integrated and ready to use! 🎉
