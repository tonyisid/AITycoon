/**
 * Building Data Access Object
 */

import { query, transaction } from '../config/database-connection';

export interface Building {
  id: number;
  building_id: string;
  land_id: number;
  owner_id: number;
  building_type: string;
  building_level: number;
  production_efficiency: number;
  power_consumption: number;
  worker_count: number;
  construction_start: Date | null;
  construction_end: Date | null;
  upgrade_start: Date | null;
  upgrade_end: Date | null;
  is_operational: boolean;
  daily_production: Record<string, number>;
  daily_consumption: Record<string, number>;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create a new building
 */
export async function createBuilding(
  building: Omit<Building, 'id' | 'created_at' | 'updated_at'>
): Promise<Building> {
  const result = await transaction(async (client) => {
    const text = `
      INSERT INTO buildings (
        building_id, land_id, owner_id, building_type,
        building_level, production_efficiency, power_consumption,
        worker_count, construction_start, construction_end,
        upgrade_start, upgrade_end, is_operational,
        daily_production, daily_consumption
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    
    const buildingId = `building_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const constructionEnd = new Date();
    constructionEnd.setHours(constructionEnd.getHours() + 1); // 1 hour construction

    const params = [
      buildingId,
      building.land_id,
      building.owner_id,
      building.building_type,
      building.building_level || 1,
      building.production_efficiency || 1.0,
      building.power_consumption || 10,
      building.worker_count || 0,
      constructionStart || new Date(),
      constructionEnd,
      building.upgrade_start || null,
      building.upgrade_end || null,
      building.is_operational || false,
      JSON.stringify(building.daily_production || {}),
      JSON.stringify(building.daily_consumption || {}),
    ];

    const result = await client.query<Building>(text, params);
    return result.rows[0];
  });

  return result;
}

/**
 * Get building by ID
 */
export async function getBuildingById(id: number): Promise<Building | null> {
  const text = 'SELECT * FROM buildings WHERE id = $1';
  const result = await query<Building>(text, [id]);
  return result.rows[0] || null;
}

/**
 * Get building by building_id
 */
export async function getBuildingByBuildingId(buildingId: string): Promise<Building | null> {
  const text = 'SELECT * FROM buildings WHERE building_id = $1';
  const result = await query<Building>(text, [buildingId]);
  return result.rows[0] || null;
}

/**
 * List buildings by owner
 */
export async function listBuildingsByOwner(ownerId: number): Promise<Building[]> {
  const text = 'SELECT * FROM buildings WHERE owner_id = $1 ORDER BY created_at DESC';
  const result = await query<Building>(text, [ownerId]);
  return result.rows;
}

/**
 * List buildings by land
 */
export async function listBuildingsByLand(landId: number): Promise<Building[]> {
  const text = 'SELECT * FROM buildings WHERE land_id = $1 ORDER BY created_at DESC';
  const result = await query<Building>(text, [landId]);
  return result.rows;
}

/**
 * Upgrade building
 */
export async function upgradeBuilding(buildingId: number): Promise<Building> {
  const upgradeEnd = new Date();
  upgradeEnd.setHours(upgradeEnd.getHours() + 24); // 1 day upgrade

  const text = `
    UPDATE buildings
    SET building_level = building_level + 1,
        upgrade_start = CURRENT_TIMESTAMP,
        upgrade_end = $1,
        is_operational = false,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
      AND is_operational = true
    RETURNING *
  `;

  const result = await query<Building>(text, [upgradeEnd, buildingId]);
  
  if (result.rows.length === 0) {
    throw new Error('Building not available for upgrade');
  }
  
  return result.rows[0];
}

/**
 * Complete construction or upgrade
 */
export async function completeBuilding(buildingId: number): Promise<Building> {
  const text = `
    UPDATE buildings
    SET construction_end = NULL,
        upgrade_end = NULL,
        is_operational = true,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
      AND (construction_end IS NOT NULL OR upgrade_end IS NOT NULL)
    RETURNING *
  `;

  const result = await query<Building>(text, [buildingId]);
  
  if (result.rows.length === 0) {
    throw new Error('Building not in construction or upgrade');
  }
  
  return result.rows[0];
}

/**
 * Update building workers
 */
export async function updateBuildingWorkers(
  buildingId: number,
  workerCount: number
): Promise<Building> {
  const text = `
    UPDATE buildings
    SET worker_count = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;

  const result = await query<Building>(text, [workerCount, buildingId]);
  return result.rows[0];
}

/**
 * Calculate building production
 */
export async function calculateProduction(buildingId: number): Promise<{
  production: Record<string, number>;
  consumption: Record<string, number>;
}> {
  const building = await getBuildingById(buildingId);
  
  if (!building || !building.is_operational) {
    throw new Error('Building not operational');
  }

  // TODO: Implement actual production calculation
  // Based on building_type, building_level, worker_count, production_efficiency
  
  const baseProduction: Record<string, number> = {
    agriculture: 100,
    mining: 150,
    factory: 200,
    electronics: 250,
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

  const production = baseProduction[building.building_type] || 0;
  const levelMultiplier = 1 + (building.building_level - 1) * 0.2;
  const workerMultiplier = Math.min(building.worker_count / 10, 2.0);

  const finalProduction = Math.floor(production * levelMultiplier * workerMultiplier * building.production_efficiency);

  return {
    production: {
      [building.building_type]: finalProduction,
    },
    consumption: {
      electricity: building.power_consumption * 24,
      water: building.worker_count * 0.1 * 24,
    },
  };
}
