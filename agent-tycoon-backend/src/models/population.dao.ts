/**
 * Population Data Access Object
 */

import { query } from '../config/database-connection';

export interface Population {
  id: number;
  player_id: number;
  total_population: number;
  employed_population: number;
  unemployed_population: number;
  satisfaction_level: number;
  growth_rate: number;
  daily_food_consumption: number;
  daily_clothing_consumption: number;
  daily_housing_consumption: number;
  daily_entertainment_consumption: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Get population by player ID
 */
export async function getPopulationByPlayerId(playerId: number): Promise<Population | null> {
  const text = 'SELECT * FROM population WHERE player_id = $1';
  const result = await query<Population>(text, [playerId]);
  return result.rows[0] || null;
}

/**
 * Create or update population for player
 */
export async function upsertPopulation(
  playerId: number,
  data: Omit<Population, 'id' | 'created_at' | 'updated_at'>
): Promise<Population> {
  // First try to update
  const existing = await getPopulationByPlayerId(playerId);
  
  if (existing) {
    // Update existing
    const text = `
      UPDATE population
      SET total_population = $1,
          employed_population = $2,
          unemployed_population = $3,
          satisfaction_level = $4,
          growth_rate = $5,
          daily_food_consumption = $6,
          daily_clothing_consumption = $7,
          daily_housing_consumption = $8,
          daily_entertainment_consumption = $9,
          updated_at = CURRENT_TIMESTAMP
      WHERE player_id = $10
      RETURNING *
    `;

    const result = await query<Population>(text, [
      data.total_population || 100,
      data.employed_population || 0,
      data.unemployed_population || 100,
      data.satisfaction_level || 0.5,
      data.growth_rate || 0.005,
      data.daily_food_consumption || 1,
      data.daily_clothing_consumption || 0.1,
      data.daily_housing_consumption || 0.001,
      data.daily_entertainment_consumption || 0.05,
      playerId,
    ]);

    return result.rows[0];
  } else {
    // Create new
    const text = `
      INSERT INTO population (
        player_id, total_population, employed_population, unemployed_population,
        satisfaction_level, growth_rate, daily_food_consumption,
        daily_clothing_consumption, daily_housing_consumption,
        daily_entertainment_consumption
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await query<Population>(text, [
      playerId,
      data.total_population || 100,
      data.employed_population || 0,
      data.unemployed_population || 100,
      data.satisfaction_level || 0.5,
      data.growth_rate || 0.005,
      data.daily_food_consumption || 1,
      data.daily_clothing_consumption || 0.1,
      data.daily_housing_consumption || 0.001,
      data.daily_entertainment_consumption || 0.05,
    ]);

    return result.rows[0];
  }
}

/**
 * Employ population
 */
export async function employPopulation(playerId: number, count: number): Promise<Population> {
  const text = `
    UPDATE population
    SET employed_population = employed_population + $1,
        unemployed_population = GREATEST(unemployed_population - $1, 0),
        updated_at = CURRENT_TIMESTAMP
    WHERE player_id = $2
      AND unemployed_population >= $1
    RETURNING *
  `;

  const result = await query<Population>(text, [count, playerId]);
  
  if (result.rows.length === 0) {
    throw new Error('Not enough unemployed population');
  }
  
  return result.rows[0];
}

/**
 * Calculate population consumption
 */
export async function calculateConsumption(playerId: number): Promise<{
  food: number;
  clothing: number;
  housing: number;
  entertainment: number;
  total: number;
}> {
  const population = await getPopulationByPlayerId(playerId);
  
  if (!population) {
    throw new Error('Population data not found');
  }

  const food = Math.floor(population.total_population * population.daily_food_consumption);
  const clothing = Math.floor(population.total_population * population.daily_clothing_consumption);
  const housing = Math.floor(population.total_population * population.daily_housing_consumption);
  const entertainment = Math.floor(population.total_population * population.daily_entertainment_consumption);
  const total = food + clothing + housing + entertainment;

  return { food, clothing, housing, entertainment, total };
}

/**
 * Update satisfaction level
 */
export async function updateSatisfaction(
  playerId: number,
  satisfactionLevel: number
): Promise<Population> {
  const text = `
    UPDATE population
    SET satisfaction_level = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE player_id = $2
    RETURNING *
  `;

  const result = await query<Population>(text, [satisfactionLevel, playerId]);
  return result.rows[0];
}

/**
 * Update population growth
 */
export async function updateGrowth(
  playerId: number,
  growthRate: number
): Promise<Population> {
  const text = `
    UPDATE population
    SET growth_rate = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE player_id = $2
    RETURNING *
  `;

  const result = await query<Population>(text, [growthRate, playerId]);
  return result.rows[0];
}
