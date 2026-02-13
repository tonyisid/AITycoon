/**
 * Helper functions for the game
 */

import { logger } from './logger';

/**
 * Format currency with commas
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('zh-CN');
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Generate random ID
 */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get item price from market (TODO: implement database query)
 */
export async function getMarketPrice(itemType: string): Promise<number> {
  // TODO: Query from database
  // const marketPrice = await MarketPrice.findOne({ where: { itemType } });
  logger.info(`Getting market price for: ${itemType}`);

  // Default prices
  const defaultPrices: { [key: string]: number } = {
    electricity: 1,
    water: 5,
    food: 500,
    clothing: 50,
    housing: 100000,
    car: 50000,
    battery: 10,
    construction_material: 100,
    computing_power: 1000,
  };

  return defaultPrices[itemType] || 100;
}

/**
 * Get building fixed cost
 */
export function getBuildingFixedCost(buildingType: string): number {
  const costMap: { [key: string]: number } = {
    agriculture: 100,
    mining: 150,
    forestry: 80,
    fishery: 120,
    food_processing: 200,
    machinery_manufacturing: 300,
    electronics_manufacturing: 400,
    chemical_plant: 350,
    textile_factory: 250,
    furniture_factory: 280,
    restaurant: 200,
    hotel: 500,
    shopping_mall: 600,
    theater: 350,
    stadium: 800,
    hospital: 700,
    school: 450,
    research_center: 900,
    data_center: 850,
  };

  return costMap[buildingType] || 200;
}

/**
 * Calculate daily wage cost
 */
export function calculateDailyWage(population: number, satisfactionLevel: number): number {
  const baseWagePerPerson = 10; // CP per person per day
  const satisfactionMultiplier = 0.5 + satisfactionLevel; // 1.0 to 1.5
  return Math.floor(population * baseWagePerPerson * satisfactionMultiplier);
}

/**
 * Calculate production output
 */
export function calculateProduction(
  buildingType: string,
  buildingLevel: number,
  workerCount: number,
  efficiency: number
): number {
  const baseProduction: { [key: string]: number } = {
    agriculture: 100,
    mining: 150,
    forestry: 80,
    fishery: 120,
    food_processing: 200,
    machinery_manufacturing: 300,
    electronics_manufacturing: 250,
    chemical_plant: 180,
    textile_factory: 160,
    furniture_factory: 170,
    restaurant: 80,
    hotel: 60,
    shopping_mall: 70,
    theater: 50,
    stadium: 40,
    hospital: 55,
    school: 45,
    research_center: 30,
    data_center: 35,
  };

  const base = baseProduction[buildingType] || 100;
  const levelMultiplier = 1 + (buildingLevel - 1) * 0.2; // +20% per level
  const workerMultiplier = Math.min(workerCount / 10, 2); // Max 2x with 20+ workers

  return Math.floor(base * levelMultiplier * workerMultiplier * efficiency);
}

/**
 * Calculate population consumption
 */
export function calculatePopulationConsumption(population: number, satisfactionLevel: number): {
  food: number;
  clothing: number;
  housing: number;
  entertainment: number;
} {
  const baseFoodPerPerson = 1; // CP per person per day
  const baseClothingPerPerson = 0.1; // CP per person per day
  const baseHousingPerPerson = 0.001; // CP per person per day
  const baseEntertainmentPerPerson = 0.05; // CP per person per day

  const satisfactionMultiplier = 0.5 + satisfactionLevel; // 1.0 to 1.5

  return {
    food: Math.floor(population * baseFoodPerPerson * satisfactionMultiplier),
    clothing: Math.floor(population * baseClothingPerPerson * satisfactionMultiplier),
    housing: Math.floor(population * baseHousingPerPerson * satisfactionMultiplier),
    entertainment: Math.floor(population * baseEntertainmentPerPerson * satisfactionMultiplier),
  };
}

/**
 * Calculate loan interest
 */
export function calculateLoanInterest(
  amount: number,
  durationDays: number,
  loanType: 'short' | 'medium' | 'long'
): number {
  const interestRates: { [key: string]: number } = {
    short: 0.05, // 5% for 7 days
    medium: 0.10, // 10% for 30 days
    long: 0.20, // 20% for 90 days
  };

  const rate = interestRates[loanType] || 0.10;
  return Math.floor(amount * rate);
}

/**
 * Calculate credit rating change
 */
export function calculateCreditRatingChange(
  currentRating: 'A' | 'B' | 'C' | 'D',
  repaidOnTime: boolean,
  loanDefaulted: boolean
): 'A' | 'B' | 'C' | 'D' {
  if (loanDefaulted) {
    // Downgrade rating
    if (currentRating === 'A') return 'B';
    if (currentRating === 'B') return 'C';
    if (currentRating === 'C') return 'D';
    return 'D';
  }

  if (repaidOnTime && currentRating !== 'A') {
    // Upgrade rating
    if (currentRating === 'D') return 'C';
    if (currentRating === 'C') return 'B';
    if (currentRating === 'B') return 'A';
    return 'A';
  }

  return currentRating;
}

/**
 * Validate API key format
 */
export function isValidApiKey(apiKey: string): boolean {
  // API key should start with 'atk_' followed by at least 32 characters
  return /^atk_[a-zA-Z0-9]{32,}$/.test(apiKey);
}

/**
 * Generate API key
 */
export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'atk_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Calculate distance between two locations
 */
export function calculateDistance(location1: number, location2: number): number {
  return Math.abs(location1 - location2);
}

/**
 * Determine if land is suitable for building type
 */
export function isLandSuitable(
  landType: string,
  buildingType: string
): boolean {
  const compatibility: { [key: string]: string[] } = {
    commercial: ['restaurant', 'hotel', 'shopping_mall', 'theater', 'stadium'],
    industrial: ['mining', 'forestry', 'fishery', 'food_processing', 'machinery_manufacturing', 'electronics_manufacturing', 'chemical_plant', 'textile_factory', 'furniture_factory'],
    agricultural: ['agriculture', 'food_processing'],
    tech: ['research_center', 'data_center', 'electronics_manufacturing'],
    residential: ['housing', 'hospital', 'school', 'restaurant', 'hotel', 'shopping_mall', 'theater'],
  };

  return compatibility[landType]?.includes(buildingType) || false;
}

/**
 * Parse webhook URL
 */
export function isValidWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
