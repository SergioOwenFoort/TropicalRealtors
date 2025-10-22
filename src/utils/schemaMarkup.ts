import { Property } from '../types';

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "Tropical Realtors",
  "description": "Premier Caribbean real estate agency specializing in properties across Aruba, Curaçao, Bonaire, Sint Maarten, Saba, and Sint Eustatius",
  "url": "https://tropicalrealtors.com",
  "logo": "https://tropicalrealtors.com/logo.png",
  "image": "https://tropicalrealtors.com/og-image.jpg",
  "telephone": "+297-123-4567",
  "email": "info@tropicalrealtors.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Caribbean",
    "addressCountry": "Multiple Islands"
  },
  "sameAs": [
    "https://facebook.com/tropicalrealtors",
    "https://instagram.com/tropicalrealtors",
    "https://linkedin.com/company/tropicalrealtors"
  ],
  "areaServed": [
    {
      "@type": "Country",
      "name": "Aruba"
    },
    {
      "@type": "Country",
      "name": "Curaçao"
    },
    {
      "@type": "Country",
      "name": "Bonaire"
    },
    {
      "@type": "Country",
      "name": "Sint Maarten"
    },
    {
      "@type": "Country",
      "name": "Saba"
    },
    {
      "@type": "Country",
      "name": "Sint Eustatius"
    }
  ],
  "priceRange": "$$$"
};

export function generatePropertySchema(property: Property) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description,
    "url": `https://tropicalrealtors.com/woning/${property.id}`,
    "image": property.images || [],
    "datePosted": property.created_at,
    "price": {
      "@type": "PriceSpecification",
      "price": property.price,
      "priceCurrency": "USD"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": property.address,
      "addressLocality": property.city,
      "addressRegion": property.island,
      "addressCountry": "Caribbean"
    },
    ...(property.latitude && property.longitude && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": property.latitude,
        "longitude": property.longitude
      }
    }),
    "numberOfRooms": property.bedrooms,
    "numberOfBathroomsTotal": property.bathrooms,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": property.area,
      "unitCode": "MTK"
    },
    ...(property.amenities && property.amenities.length > 0 && {
      "amenityFeature": property.amenities.map(amenity => ({
        "@type": "LocationFeatureSpecification",
        "name": amenity
      }))
    }),
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Property Type",
        "value": property.type
      },
      {
        "@type": "PropertyValue",
        "name": "Transaction Type",
        "value": property.transaction_type
      },
      ...(property.category ? [{
        "@type": "PropertyValue",
        "name": "Category",
        "value": property.category
      }] : [])
    ]
  };
}

export function generateVacationPropertySchema(property: any) {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": property.name || property.title,
    "description": property.description,
    "url": `https://tropicalrealtors.com/vakantie/${property.id}`,
    "image": property.images || [],
    "priceRange": `$${property.price || property.price_per_night}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.city,
      "addressRegion": property.island,
      "addressCountry": "Caribbean"
    },
    ...(property.latitude && property.longitude && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": property.latitude,
        "longitude": property.longitude
      }
    }),
    "numberOfRooms": property.bedrooms,
    ...(property.amenities && property.amenities.length > 0 && {
      "amenityFeature": property.amenities.map((amenity: string) => ({
        "@type": "LocationFeatureSpecification",
        "name": amenity
      }))
    }),
    ...(property.rating && {
      "starRating": {
        "@type": "Rating",
        "ratingValue": property.rating,
        "bestRating": "5"
      }
    }),
    ...(property.rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": property.rating,
        "reviewCount": property.reviews || 0
      }
    }),
    "maximumAttendeeCapacity": property.max_guests || property.bedrooms * 2
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

export function generateLocalBusinessSchema(island: string) {
  const addresses: Record<string, any> = {
    'aruba': {
      streetAddress: "Palm Beach Plaza, L.G. Smith Boulevard 94",
      addressLocality: "Palm Beach",
      addressRegion: "Aruba",
      postalCode: "00000",
      addressCountry: "AW",
      telephone: "+297-586-4200",
      latitude: "12.5656",
      longitude: "-70.0417"
    },
    'curacao': {
      streetAddress: "Schottegatweg Oost 205",
      addressLocality: "Willemstad",
      addressRegion: "Curaçao",
      postalCode: "00000",
      addressCountry: "CW",
      telephone: "+5999-465-3500",
      latitude: "12.1224",
      longitude: "-68.8824"
    },
    'bonaire': {
      streetAddress: "Kaya Grandi 46",
      addressLocality: "Kralendijk",
      addressRegion: "Bonaire",
      postalCode: "00000",
      addressCountry: "BQ",
      telephone: "+599-717-5000",
      latitude: "12.1540",
      longitude: "-68.2795"
    },
    'sint-maarten': {
      streetAddress: "Welfare Road 134",
      addressLocality: "Philipsburg",
      addressRegion: "Sint Maarten",
      postalCode: "00000",
      addressCountry: "SX",
      telephone: "+1-721-542-2345",
      latitude: "18.0179",
      longitude: "-63.0478"
    }
  };

  const address = addresses[island.toLowerCase()] || addresses['aruba'];

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": `Tropical Realtors - ${island}`,
    "image": "https://tropicalrealtors.com/logo.png",
    "address": {
      "@type": "PostalAddress",
      ...address
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": address.latitude,
      "longitude": address.longitude
    },
    "url": `https://tropicalrealtors.com/eiland/${island.toLowerCase()}`,
    "telephone": address.telephone,
    "priceRange": "$$$",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "08:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "14:00"
      }
    ]
  };
}
