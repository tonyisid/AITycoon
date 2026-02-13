/**
 * Land Data Access Object
 */

import { query } from '../config/database-connection';

export interface Land {
  id: number;
  land_id: string;
  land_type: 'commercial' | 'industrial' | 'agricultural' | 'tech' | 'residential';
  area: number;
  location: number;
  power_capacity: number;
  water_resource: number;
  transport_access: number;
  policy_restriction: number;
  base_price: number;
  current_owner_id: number | null;
  auction_id: string | null;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Get land by ID
 */
export async function getLandById(id: number): Promise<Land | null> {
  const text = 'SELECT * FROM lands WHERE id = $1';
  const result = await query<Land>(text, [id]);
  return result.rows[0] || null;
}

/**
 * Get land by land_id
 */
export async function getLandByLandId(landId: string): Promise<Land | null> {
  const text = 'SELECT * FROM lands WHERE land_id = $1';
  const result = await query<Land>(text, [landId]);
  return result.rows[0] || null;
}

/**
 * List available lands with filters
 */
export async function listLands(filters: {
  landType?: string;
  minLocation?: number;
  maxLocation?: number;
  page?: number;
  pageSize?: number;
}): Promise<{
  lands: Land[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const { landType, minLocation, maxLocation, page = 1, pageSize = 20 } = filters;
  const offset = (page - 1) * pageSize;

  // Build WHERE clause
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (landType) {
    conditions.push(`land_type = $${paramIndex}`);
    params.push(landType);
    paramIndex++;
  }

  if (minLocation !== undefined) {
    conditions.push(`location >= $${paramIndex}`);
    params.push(minLocation);
    paramIndex++;
  }

  if (maxLocation !== undefined) {
    conditions.push(`location <= $${paramIndex}`);
    params.push(maxLocation);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count total
  const countText = `SELECT COUNT(*) FROM lands ${whereClause}`;
  const countResult = await query<{ count: string }>(countText, params);
  const total = parseInt(countResult.rows[0].count);

  // Get lands
  const dataText = `
    SELECT * FROM lands
    ${whereClause}
    ORDER BY location DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(pageSize, offset);
  
  const dataResult = await query<Land>(dataText, params);
  const totalPages = Math.ceil(total / pageSize);

  return {
    lands: dataResult.rows,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Purchase land
 */
export async function purchaseLand(landId: number, playerId: number): Promise<Land> {
  const text = `
    UPDATE lands
    SET current_owner_id = $1,
        is_available = false,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
      AND is_available = true
    RETURNING *
  `;
  const result = await query<Land>(text, [playerId, landId]);
  
  if (result.rows.length === 0) {
    throw new Error('Land not available for purchase');
  }
  
  return result.rows[0];
}

/**
 * Create auction for land
 */
export async function createAuction(landId: number, playerId: number, startPrice: number): Promise<Land> {
  const auctionId = `auction_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  const text = `
    UPDATE lands
    SET auction_id = $1,
        current_owner_id = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
  `;
  const result = await query<Land>(text, [auctionId, playerId, landId]);
  
  if (result.rows.length === 0) {
    throw new Error('Land not found');
  }
  
  return result.rows[0];
}

/**
 * Update land attributes
 */
export async function updateLand(
  landId: number,
  updates: Partial<Omit<Land, 'id' | 'created_at'>>
): Promise<Land> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(landId);

  const text = `
    UPDATE lands
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await query<Land>(text, values);
  return result.rows[0];
}
