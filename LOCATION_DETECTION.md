# Location Detection Feature

This document describes the automatic location detection feature implemented for the ABCMakelaars website.

## Overview

The website now automatically detects the user's location and sets the appropriate island (Bonaire, Aruba, or Curaçao) as the default. This provides a more personalized experience by showing relevant content for the user's region.

## How It Works

### Detection Methods

The system uses multiple detection methods in order of priority:

1. **Browser-based Detection** (Privacy-friendly, instant)
   - Timezone detection using `Intl.DateTimeFormat`
   - Language preference analysis from `navigator.languages`
   - Direct mapping of Caribbean timezones to islands

2. **IP-based Geolocation** (Fallback method)
   - Primary service: ipapi.co (1000 requests/day free)
   - Fallback service: api.country.is
   - Only used if browser detection fails

3. **Default Fallback**
   - Defaults to Bonaire if no detection method works

### Country-to-Island Mapping

The system maps detected countries to the most appropriate island:

- **Direct matches**: BQ→Bonaire, AW→Aruba, CW→Curaçao
- **Netherlands**: Bonaire (as it's part of the Netherlands)
- **Caribbean neighbors**: VE→Curaçao, CO→Aruba
- **North America**: US/CA→Aruba (popular tourist destination)
- **Europe**: DE/FR/GB/BE/IT/ES→Bonaire

## User Experience

### Automatic Detection
- Runs on first visit or when no manual selection exists
- Shows a subtle loading indicator during detection
- Completely transparent to the user if successful

### User Notification
- Shows a friendly banner when location is auto-detected
- Allows users to confirm or change the selection
- Banner can be dismissed and remembers the preference

### Manual Override
- Island selector available in the header navigation
- Users can switch islands at any time
- Manual selection overrides automatic detection
- Preference is saved in localStorage

## Technical Implementation

### Files Created/Modified

1. **New Files**:
   - `src/utils/locationDetection.ts` - Core detection logic
   - `src/components/layout/LocationDetectionBanner.tsx` - User notification
   - `src/components/layout/LocationDetectionIndicator.tsx` - Loading indicator
   - `src/components/layout/IslandSelector.tsx` - Manual selector

2. **Modified Files**:
   - `src/contexts/island.context.tsx` - Enhanced with auto-detection
   - `src/components/layout/Layout.tsx` - Added detection components
   - `src/components/layout/menu*.tsx` - Added island selector
   - `src/pages/realtor/PropertyForm.tsx` - Island-aware locations
   - `src/components/search/filters/LocationFilter.tsx` - Island-aware filtering

### Privacy & Performance

- **Privacy-first**: Browser detection doesn't send any data externally
- **Graceful degradation**: Works even if IP services are blocked
- **Caching**: Results are cached in localStorage
- **No tracking**: No personal data is stored or transmitted

## User Settings

The system respects user preferences through localStorage:

- `selectedIsland`: Currently selected island
- `islandAutoDetected`: Whether selection was auto-detected
- `locationBannerDismissed`: Whether user dismissed the notification banner

## Fallback Strategy

If all detection methods fail:
1. Default to Bonaire
2. User can manually select their preferred island
3. System remembers the manual selection

## Benefits

1. **Improved UX**: Users see relevant content immediately
2. **Regional Relevance**: Properties and agents for their area
3. **Reduced Friction**: No need to manually select island
4. **Privacy-Conscious**: Minimal data collection
5. **Flexible**: Easy to override or change

## Future Enhancements

Potential improvements for the future:

1. **Refined Mapping**: More granular country-to-island mapping
2. **User Analytics**: Track detection accuracy (anonymized)
3. **Geolocation API**: Browser GPS detection (with permission)
4. **Smart Defaults**: Learn from user behavior patterns
5. **Multi-language**: Detection messaging in multiple languages

## Development Notes

- All detection is non-blocking and fails gracefully
- Console logs help with debugging detection results
- Easy to disable by removing the `detectUserIsland()` call
- Fully compatible with existing manual island selection
