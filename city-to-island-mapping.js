// City to Island mapping - automatically assigns properties to correct islands
// This will fix the issue where cities are assigned to wrong islands

const CITY_TO_ISLAND_MAP = {
  // Bonaire cities
  'Kralendijk': 'Bonaire',
  'Rincon': 'Bonaire', 
  'Antriol': 'Bonaire',
  'Nikiboko': 'Bonaire',
  'Sabana': 'Bonaire',
  'Goto': 'Bonaire',
  'Flamingo': 'Bonaire',
  'Belnem': 'Bonaire',
  'Noord Saliña': 'Bonaire',
  'Playa': 'Bonaire',
  'Hato': 'Bonaire',
  'Santa Barbara': 'Bonaire',
  'Tera Korá': 'Bonaire',
  'Dos Pos': 'Bonaire',
  'Pekelmeer': 'Bonaire',
  'Klein Bonaire': 'Bonaire',

  // Aruba cities
  'Oranjestad': 'Aruba',
  'Noord': 'Aruba',
  'Palm Beach': 'Aruba',
  'Eagle Beach': 'Aruba',
  'Santa Cruz': 'Aruba',
  'Savaneta': 'Aruba',
  'San Nicolas': 'Aruba',
  'Paradera': 'Aruba',
  'Tanki Leendert': 'Aruba',
  'Bubali': 'Aruba',
  'Malmok': 'Aruba',
  'Arashi': 'Aruba',
  'California': 'Aruba',
  'Westpunt': 'Aruba',
  'Pos Chiquito': 'Aruba',

  // Curaçao cities  
  'Willemstad': 'Curaçao',
  'Punda': 'Curaçao',
  'Otrobanda': 'Curaçao',
  'Scharloo': 'Curaçao',
  'Jan Thiel': 'Curaçao',
  'Mambo Beach': 'Curaçao',
  'Piscadera': 'Curaçao',
  'Santa Barbara': 'Curaçao',
  'Julianadorp': 'Curaçao',
  'Banda Abou': 'Curaçao',
  'Banda Ariba': 'Curaçao',
  'Westpunt': 'Curaçao',
  'Lagun': 'Curaçao',
  'Sint Michiel': 'Curaçao',
  'Caracasbaai': 'Curaçao',
  'Spaanse Water': 'Curaçao',
  'Jan Sofat': 'Curaçao',

  // Saba cities
  'The Bottom': 'Saba',
  'Windwardside': 'Saba',
  'St. Johns': 'Saba',
  'Hell\'s Gate': 'Saba',
  'Hells Gate': 'Saba',
  'Fort Bay': 'Saba',
  'Mary\'s Point': 'Saba',
  'Marys Point': 'Saba',
  'Troy Hill': 'Saba',
  'Juliana\'s': 'Saba',
  'Julianas': 'Saba',
  'Well\'s Bay': 'Saba',
  'Wells Bay': 'Saba',

  // Sint Eustatius cities
  'Oranjestad': 'Sint Eustatius', // Note: Both Aruba and Sint Eustatius have Oranjestad
  'Golden Rock': 'Sint Eustatius',
  'Concordia': 'Sint Eustatius', 
  'Lynch': 'Sint Eustatius',
  'Jeems': 'Sint Eustatius',
  'Union': 'Sint Eustatius',
  'Bay Brow': 'Sint Eustatius',
  'English Quarter': 'Sint Eustatius',
  'Lower Town': 'Sint Eustatius',
  'Upper Town': 'Sint Eustatius',

  // Sint Maarten cities
  'Philipsburg': 'Sint Maarten',
  'Simpson Bay': 'Sint Maarten',
  'Cupecoy': 'Sint Maarten',
  'Maho': 'Sint Maarten', 
  'Cole Bay': 'Sint Maarten',
  'Marigot': 'Sint Maarten',
  'Grand Case': 'Sint Maarten',
  'Oyster Pond': 'Sint Maarten',
  'Dawn Beach': 'Sint Maarten',
  'Beacon Hill': 'Sint Maarten',
  'Point Blanche': 'Sint Maarten',
  'St. Peters': 'Sint Maarten',
  'French Quarter': 'Sint Maarten',
  'Lowlands': 'Sint Maarten',
  'Middle Region': 'Sint Maarten',
  'Dutch Quarter': 'Sint Maarten',
  'Sandy Ground': 'Sint Maarten',
  'Orient Bay': 'Sint Maarten',
  'Anse Marcel': 'Sint Maarten'
};

// Special handling for cities that exist on multiple islands
const AMBIGUOUS_CITIES = {
  'Oranjestad': {
    'Aruba': 'Aruba',
    'Sint Eustatius': 'Sint Eustatius'
  },
  'Santa Barbara': {
    'Bonaire': 'Bonaire', 
    'Curaçao': 'Curaçao'
  },
  'Westpunt': {
    'Aruba': 'Aruba',
    'Curaçao': 'Curaçao'
  }
};

/**
 * Get the correct island for a city name
 * @param {string} city - The city name
 * @param {string} currentCountry - The currently assigned country (for ambiguous cities)
 * @returns {string} - The correct island name
 */
function getIslandForCity(city, currentCountry = null) {
  // Handle ambiguous cities first
  if (AMBIGUOUS_CITIES[city]) {
    // If we know the current country, use that to disambiguate
    if (currentCountry && AMBIGUOUS_CITIES[city][currentCountry]) {
      return AMBIGUOUS_CITIES[city][currentCountry];
    }
    // Default to the first option for ambiguous cities
    return Object.values(AMBIGUOUS_CITIES[city])[0];
  }
  
  // Direct mapping
  return CITY_TO_ISLAND_MAP[city] || currentCountry || 'Bonaire';
}

/**
 * Get all cities for a specific island
 * @param {string} island - The island name
 * @returns {string[]} - Array of city names for that island
 */
function getCitiesForIsland(island) {
  return Object.keys(CITY_TO_ISLAND_MAP).filter(
    city => CITY_TO_ISLAND_MAP[city] === island
  );
}

module.exports = {
  CITY_TO_ISLAND_MAP,
  AMBIGUOUS_CITIES,
  getIslandForCity,
  getCitiesForIsland
};
