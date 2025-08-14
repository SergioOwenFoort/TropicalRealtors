// Caribbean Islands ABC (Aruba, Bonaire, Curaçao)

export interface Island {
  label: string;
  flag: string;
}

// European Countries with Properties
export const EUROPEAN_COUNTRIES: Island[] = [
  { label: 'Nederland', flag: '🇳🇱' },
  { label: 'Spanje', flag: '🇪🇸' },
  { label: 'Frankrijk', flag: '🇫🇷' },
  { label: 'Italië', flag: '🇮🇹' },
  { label: 'Portugal', flag: '🇵🇹' },
  { label: 'Griekenland', flag: '🇬🇷' },
  { label: 'Kroatië', flag: '🇭�' },
  { label: 'Oostenrijk', flag: '�🇦🇹' },
  { label: 'Duitsland', flag: '🇩�' },
  { label: 'België', flag: '🇧🇪' },
].sort((a, b) => a.label.localeCompare(b.label));

// Caribbean Islands
export const CARIBBEAN_COUNTRIES: Island[] = [
  { label: 'Bonaire', flag: '🇧🇶' },
  { label: 'Aruba', flag: '🇦🇼' },
  { label: 'Curaçao', flag: '🇨🇼' },
  { label: 'Saba', flag: '🇸🇦' },
  { label: 'Sint Maarten', flag: '🇸🇽' },
  { label: 'Sint Eustatius', flag: '🇧🇶' },
].sort((a, b) => a.label.localeCompare(b.label));
// Saba locations
export const SABA_LOCATIONS: Island[] = [
  { label: 'The Bottom', flag: '🇸🇦' },
  { label: 'Windwardside', flag: '🇸🇦' },
  { label: 'St. Johns', flag: '🇸🇦' },
  { label: 'Hell’s Gate', flag: '🇸🇦' },
  { label: 'Fort Bay', flag: '🇸🇦' },
  { label: 'Mary’s Point', flag: '🇸🇦' },
  { label: 'Troy Hill', flag: '🇸🇦' },
  { label: 'Juliana’s', flag: '🇸🇦' },
  { label: 'Well’s Bay', flag: '🇸🇦' },
  { label: 'Cove Bay', flag: '🇸🇦' },
  { label: 'Spring Bay', flag: '🇸🇦' },
  { label: 'Flat Point', flag: '🇸🇦' },
  { label: 'Green Island', flag: '🇸🇦' },
].sort((a, b) => a.label.localeCompare(b.label));

// Bonaire locations
export const BONAIRE_LOCATIONS: Island[] = [
  { label: '1000 Steps', flag: '🇧🇶' },
  { label: 'Adrea I', flag: '🇧🇶' },
  { label: 'Adrea II', flag: '🇧🇶' },
  { label: 'Amboina', flag: '🇧🇶' },
  { label: 'Antriol', flag: '🇧🇶' },
  { label: 'Bario Mamparia Kutu', flag: '🇧🇶' },
  { label: 'Bario Silesie', flag: '🇧🇶' },
  { label: 'Belnem', flag: '🇧🇶' },
  { label: 'Bise Morto', flag: '🇧🇶' },
  { label: 'Boka Slagbaai', flag: '🇧🇶' },
  { label: 'Bona Bista', flag: '🇧🇶' },
  { label: 'Bonaire National Marine Park', flag: '🇧🇶' },
  { label: 'Bricat', flag: '🇧🇶' },
  { label: 'Cliff', flag: '🇧🇶' },
  { label: 'Den Chefi', flag: '🇧🇶' },
  { label: 'Den Tera', flag: '🇧🇶' },
  { label: 'Gotomeer', flag: '🇧🇶' },
  { label: 'Hato', flag: '🇧🇶' },
  { label: 'Klein Bonaire', flag: '🇧🇶' },
  { label: 'Kralendijk', flag: '🇧🇶' },
  { label: 'Kunuku', flag: '🇧🇶' },
  { label: 'Labra', flag: '🇧🇶' },
  { label: 'Lac', flag: '🇧🇶' },
  { label: 'Lagun Ruins', flag: '🇧🇶' },
  { label: 'Luchthaven Gebied', flag: '🇧🇶' },
  { label: 'Margate Bay', flag: '🇧🇶' },
  { label: 'Nawati', flag: '🇧🇶' },
  { label: 'Nikiboko', flag: '🇧🇶' },
  { label: 'Noord Saliña', flag: '🇧🇶' },
  { label: 'Ol Blue', flag: '🇧🇶' },
  { label: 'Oranje Pan', flag: '🇧🇶' },
  { label: 'Pekelmeer', flag: '🇧🇶' },
  { label: 'Playa', flag: '🇧🇶' },
  { label: 'Playa Benge', flag: '🇧🇶' },
  { label: 'Playa Chiquitu', flag: '🇧🇶' },
  { label: 'Playa Funchi', flag: '🇧🇶' },
  { label: 'Red Beryl', flag: '🇧🇶' },
  { label: 'Rincon', flag: '🇧🇶' },
  { label: 'Sabal Palm', flag: '🇧🇶' },
  { label: 'Sabana', flag: '🇧🇶' },
  { label: 'Salinas (Zoutpannen)', flag: '🇧🇶' },
  { label: 'Santa Barbara Crowns (Sabadeco)', flag: '🇧🇶' },
  { label: 'Santa Barbara Republiek', flag: '🇧🇶' },
  { label: 'Sorobon', flag: '🇧🇶' },
  { label: 'Subi Brandaris', flag: '🇧🇶' },
  { label: 'Tera Korá', flag: '🇧🇶' },
  { label: 'Tolo', flag: '🇧🇶' },
  { label: 'Tori Reef', flag: '🇧🇶' },
  { label: 'Washington Slagbaai National Park', flag: '🇧🇶' },
  { label: 'Wayaka', flag: '🇧🇶' },
  { label: 'Webers Joy', flag: '🇧🇶' },
  { label: 'Windsock', flag: '🇧🇶' },
].sort((a, b) => a.label.localeCompare(b.label));

// Aruba locations
export const ARUBA_LOCATIONS: Island[] = [
  { label: 'Arashi', flag: '🇦🇼' },
  { label: 'Boca Catalina', flag: '🇦🇼' },
  { label: 'Boca Grandi', flag: '🇦🇼' },
  { label: 'Bubali', flag: '🇦🇼' },
  { label: 'California Dunes', flag: '🇦🇼' },
  { label: 'Druif', flag: '🇦🇼' },
  { label: 'Eagle Beach', flag: '🇦🇼' },
  { label: 'Hooiberg', flag: '🇦🇼' },
  { label: 'Manchebo', flag: '🇦🇼' },
  { label: 'Noord', flag: '🇦🇼' },
  { label: 'Oranjestad', flag: '🇦🇼' },
  { label: 'Palm Beach', flag: '🇦🇼' },
  { label: 'Paradera', flag: '🇦🇼' },
  { label: 'Pos Chiquito', flag: '🇦🇼' },
  { label: 'Reina Beatrix Airport', flag: '🇦🇼' },
  { label: 'Rodgers Beach', flag: '🇦🇼' },
  { label: 'San Nicolas', flag: '🇦🇼' },
  { label: 'Santa Cruz', flag: '🇦🇼' },
  { label: 'Savaneta', flag: '🇦🇼' },
  { label: 'Tanki Leendert', flag: '🇦🇼' },
  { label: 'Westpunt', flag: '🇦🇼' },
].sort((a, b) => a.label.localeCompare(b.label));

// Curaçao locations
export const CURACAO_LOCATIONS: Island[] = [
  { label: 'Banda Abou', flag: '🇨🇼' },
  { label: 'Banda Ariba', flag: '🇨🇼' },
  { label: 'Barber', flag: '🇨🇼' },
  { label: 'Boca Samí', flag: '🇨🇼' },
  { label: 'Boca Santa Martha', flag: '🇨🇼' },
  { label: 'Caracasbaai', flag: '🇨🇼' },
  { label: 'Cas Cora', flag: '🇨🇼' },
  { label: 'Groot Santa Martha', flag: '🇨🇼' },
  { label: 'Hato Airport', flag: '🇨🇼' },
  { label: 'Jan Thiel', flag: '🇨🇼' },
  { label: 'Julianadorp', flag: '🇨🇼' },
  { label: 'Kenepa Beach', flag: '🇨🇼' },
  { label: 'Koraal Partier', flag: '🇨🇼' },
  { label: 'Lagun', flag: '🇨🇼' },
  { label: 'Mambo Beach', flag: '🇨🇼' },
  { label: 'Otrobanda', flag: '🇨🇼' },
  { label: 'Piscadera', flag: '🇨🇼' },
  { label: 'Punda', flag: '🇨🇼' },
  { label: 'Santa Barbara', flag: '🇨🇼' },
  { label: 'Scharloo', flag: '🇨🇼' },
  { label: 'Schottegat', flag: '🇨🇼' },
  { label: 'Seaquarium Beach', flag: '🇨🇼' },
  { label: 'Sint Michiel', flag: '🇨🇼' },
  { label: 'Spaanse Water', flag: '🇨🇼' },
  { label: 'Westpunt', flag: '🇨🇼' },
  { label: 'Willemstad', flag: '🇨🇼' },
].sort((a, b) => a.label.localeCompare(b.label));

// Sint Eustatius locations
export const SINT_EUSTATIUS_LOCATIONS: Island[] = [
  { label: 'Oranjestad', flag: '🇧🇶' },
  { label: 'Golden Rock', flag: '🇧🇶' },
  { label: 'Concordia', flag: '🇧🇶' },
  { label: 'Lynch', flag: '🇧🇶' },
  { label: 'Jeems', flag: '🇧🇶' },
  { label: 'Union', flag: '🇧🇶' },
  { label: 'Bay Brow', flag: '🇧🇶' },
  { label: 'English Quarter', flag: '🇧🇶' },
  { label: 'Lower Town', flag: '🇧🇶' },
  { label: 'Upper Town', flag: '🇧🇶' },
  { label: 'Corre Corre', flag: '🇧🇶' },
  { label: 'Schotsenhoek', flag: '🇧🇶' },
].sort((a, b) => a.label.localeCompare(b.label));

// Sint Maarten locations
export const SINT_MAARTEN_LOCATIONS: Island[] = [
  { label: 'Philipsburg', flag: '🇸🇽' },
  { label: 'Simpson Bay', flag: '🇸🇽' },
  { label: 'Cupecoy', flag: '🇸🇽' },
  { label: 'Maho', flag: '🇸🇽' },
  { label: 'Cole Bay', flag: '🇸🇽' },
  { label: 'Marigot', flag: '🇸🇽' },
  { label: 'Grand Case', flag: '🇸🇽' },
  { label: 'Oyster Pond', flag: '🇸🇽' },
  { label: 'Dawn Beach', flag: '🇸🇽' },
  { label: 'Beacon Hill', flag: '🇸🇽' },
  { label: 'Point Blanche', flag: '🇸🇽' },
  { label: 'St. Peters', flag: '🇸🇽' },
  { label: 'French Quarter', flag: '🇸🇽' },
  { label: 'Lowlands', flag: '🇸🇽' },
  { label: 'Terres Basses', flag: '🇸🇽' },
  { label: 'Middle Region', flag: '🇸🇽' },
  { label: 'Dutch Quarter', flag: '🇸🇽' },
  { label: 'Sandy Ground', flag: '🇸🇽' },
  { label: 'Orient Bay', flag: '🇸🇽' },
  { label: 'Anse Marcel', flag: '🇸🇽' },
].sort((a, b) => a.label.localeCompare(b.label));

// Keep ISLANDS_COUNTRIES for backward compatibility, pointing to Bonaire locations
export const ISLANDS_COUNTRIES = BONAIRE_LOCATIONS;

// Helper function to get locations by island
export const getLocationsByIsland = (island: 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten'): Island[] => {
  switch (island) {
    case 'bonaire':
      return BONAIRE_LOCATIONS;
    case 'aruba':
      return ARUBA_LOCATIONS;
    case 'curacao':
      return CURACAO_LOCATIONS;
    case 'saba':
      return SABA_LOCATIONS;
    case 'sint-eustatius':
      return SINT_EUSTATIUS_LOCATIONS;
    case 'sint-maarten':
      return SINT_MAARTEN_LOCATIONS;
    default:
      return BONAIRE_LOCATIONS;
  }
};

// Helper function to get island flag
export const getIslandFlag = (island: 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten'): string => {
  switch (island) {
    case 'bonaire':
      return '🇧🇶';
    case 'aruba':
      return '🇦🇼';
    case 'curacao':
      return '🇨🇼';
    case 'saba':
      return '🇸🇦';
    case 'sint-eustatius':
      return '🇧🇶';
    case 'sint-maarten':
      return '🇸🇽';
    default:
      return '';
  }
};

// Helper function to get island display label
export const getIslandDisplayLabel = (island: 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten'): string => {
  switch (island) {
    case 'bonaire':
      return 'Bonaire';
    case 'aruba':
      return 'Aruba';
    case 'curacao':
      return 'Curaçao';
    case 'saba':
      return 'Saba';
    case 'sint-eustatius':
      return 'Sint Eustatius';
    case 'sint-maarten':
      return 'Sint Maarten';
    default:
      return '';
  }
};
