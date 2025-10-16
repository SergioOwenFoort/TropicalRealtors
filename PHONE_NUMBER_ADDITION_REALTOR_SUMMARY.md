# Phone Number Addition to Property System - Summary

## Overview
Added phone_number field to the regular property (realtor) listing system, including single property uploader and CSV/Excel bulk uploader.

## Changes Made

### 1. Type Definition (src/types/index.ts)
- Added `phone_number?: string` to the `Property` interface
- Positioned after `country` field, before `postalCode`
- Optional field to maintain backward compatibility

### 2. Single Property Uploader (src/components/realtor/ListingUploader.tsx)
- Updated `PropertyFormData` interface to include `phone_number: string`
- Added phone_number to all formData initializations:
  - Initial state (line 62): `phone_number: initialData?.phone_number || ''`
  - Existing property load (line 103): `phone_number: existingProperty.phone_number || ''`
  - Reset form function (line 518): `phone_number: ''`
- Added UI input field between Address and City fields:
  - Label: "Telefoonnummer"
  - Type: `tel`
  - Placeholder: "+599 123 4567"
  - Optional field (no asterisk)

### 3. CSV/Excel Bulk Uploader
#### Data Transformer (src/utils/dataTransformer.ts)
- Updated `transformPropertyData` function to parse phone number from CSV rows
- Supports two column names: `phone_number` (preferred) or `phone` (fallback)
- Falls back to empty string if not provided: `row.phone_number || row.phone || ""`

#### CSV Uploader Component (src/components/realtor/CsvUploader.tsx)
- Updated optional columns documentation
- Changed from: `"country, postalCode, bedrooms, bathrooms, features, status, makelaarId"`
- Changed to: `"country, phone_number (of phone), postalCode, bedrooms, bathrooms, features, status, makelaarId"`

### 4. Database Migration (add_phone_number_to_properties.sql)
- Creates a new TEXT column `phone_number` in the `properties` table
- Includes existence check to prevent duplicate column errors
- Provides verification queries to confirm successful migration
- Includes example query for testing

## Database Migration Instructions

Run the SQL migration file in your Supabase SQL editor:
```sql
-- File: add_phone_number_to_properties.sql
```

This will:
1. Check if the column already exists
2. Add the column if it doesn't exist
3. Display confirmation message
4. Show the column structure for verification

## Format
- Phone numbers should be entered in international format
- Example: "+599 123 4567" (Caribbean islands format)
- Field is optional and can be left empty

## CSV Column Options
When uploading via CSV/Excel, you can use either:
- `phone_number` (preferred column name)
- `phone` (alternative column name)

If neither column is present, the field will be set to an empty string.

## Testing Checklist
- [ ] Single property upload form displays phone number field
- [ ] Phone number is saved when creating new property
- [ ] Phone number is displayed when editing existing property
- [ ] CSV upload with `phone_number` column works correctly
- [ ] CSV upload with `phone` column works correctly
- [ ] CSV upload without phone column works correctly (empty string)
- [ ] Database migration runs successfully
- [ ] Phone numbers display correctly in property listings

## Related Files
- Type definitions: `src/types/index.ts`
- Single uploader: `src/components/realtor/ListingUploader.tsx`
- CSV parser: `src/utils/dataTransformer.ts`
- CSV uploader: `src/components/realtor/CsvUploader.tsx`
- Database migration: `add_phone_number_to_properties.sql`

## Notes
- This implementation mirrors the phone_number addition for vacation properties
- Both systems now have consistent phone number handling
- Phone number field is optional in both UI and database
- No breaking changes - existing data and functionality remain unaffected
