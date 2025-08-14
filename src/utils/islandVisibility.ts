// Utility to get enabled islands from localStorage
import { CARIBBEAN_COUNTRIES } from '../data/countries';

const ISLAND_FLAG_MAP: Record<string, string> = {};
CARIBBEAN_COUNTRIES.forEach(island => {
  ISLAND_FLAG_MAP[island.label.toLowerCase()] = island.flag || '';
});

export const ALL_ISLANDS = [
  { key: 'bonaire', label: 'Bonaire', flag: ISLAND_FLAG_MAP['bonaire'] },
  { key: 'aruba', label: 'Aruba', flag: ISLAND_FLAG_MAP['aruba'] },
  { key: 'curacao', label: 'Curaçao', flag: ISLAND_FLAG_MAP['curacao'] },
  { key: 'sint-maarten', label: 'Sint Maarten', flag: ISLAND_FLAG_MAP['sint maarten'] },
  { key: 'saba', label: 'Saba', flag: ISLAND_FLAG_MAP['saba'] },
  { key: 'sint-eustatius', label: 'Sint Eustatius', flag: ISLAND_FLAG_MAP['sint eustatius'] }
];

export function getEnabledIslands() {
  const stored = localStorage.getItem('islandVisibility');
  if (!stored) return ALL_ISLANDS.map(i => i.key);
  const visibility = JSON.parse(stored);
  // Fix: allow both old and new keys for Sint Maarten and Sint Eustatius
  const keyMap: Record<string, string> = {
    'sintmaarten': 'sint-maarten',
    'sinteustatius': 'sint-eustatius',
    'aruba': 'aruba',
    'bonaire': 'bonaire',
    'curacao': 'curacao',
    'saba': 'saba',
    'sint-maarten': 'sint-maarten',
    'sint-eustatius': 'sint-eustatius'
  };
  return ALL_ISLANDS.filter(i => {
    // Accept both old and new keys for compatibility
    const mappedKey = Object.entries(keyMap).find(([_, v]) => v === i.key)?.[0];
    return visibility[i.key] || (mappedKey && visibility[mappedKey]);
  }).map(i => i.key);
}

export function getEnabledIslandOptions() {
  const stored = localStorage.getItem('islandVisibility');
  if (!stored) return ALL_ISLANDS;
  const visibility = JSON.parse(stored);
  const keyMap: Record<string, string> = {
    'sintmaarten': 'sint-maarten',
    'sinteustatius': 'sint-eustatius',
    'aruba': 'aruba',
    'bonaire': 'bonaire',
    'curacao': 'curacao',
    'saba': 'saba',
    'sint-maarten': 'sint-maarten',
    'sint-eustatius': 'sint-eustatius'
  };
  return ALL_ISLANDS.filter(i => {
    const mappedKey = Object.entries(keyMap).find(([_, v]) => v === i.key)?.[0];
    return visibility[i.key] || (mappedKey && visibility[mappedKey]);
  });
}
