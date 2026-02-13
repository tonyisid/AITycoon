/**
 * Player Data Access Object
 */

import { PoolClient } from 'pg';
import { query, transaction } from '../config/database-connection';

export interface Player {
  id: number;
  agent_id: string;
  agent_name: string;
  webhook_url: string | null;
  api_key: string;
  credit_points: number;
  credit_rating: 'A' | 'B' | 'C' | 'D';
  current_season: number;
  total_wealth: number;
  is_bankrupt: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create a new player
 */
export async function createPlayer(player: Omit<Player, 'id' | 'created_at' | 'updated_at'>): Promise<Player> {
  const result = await transaction(async (client) => {
    const text = `
      INSERT INTO players (agent_id, agent_name, webhook_url, api_key, credit_points, credit_rating, current_season, total_wealth, is_bankrupt)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const params = [
      player.agent_id,
      player.agent_name,
      player.webhook_url || null,
      player.api_key,
      player.credit_points || 10000,
      player.credit_rating || 'B',
      player.current_season || 1,
      player.total_wealth || 10000,
      player.is_bankrupt || false,
    ];
    const result = await client.query<Player>(text, params);
    return result.rows[0];
  });
  return result;
}

/**
 * Get player by API key
 */
export async function getPlayerByApiKey(apiKey: string): Promise<Player | null> {
  const text = 'SELECT * FROM players WHERE api_key = $1';
  const result = await query<Player>(text, [apiKey]);
  return result.rows[0] || null;
}

/**
 * Get player by agent ID
 */
export async function getPlayerByAgentId(agentId: string): Promise<Player | null> {
  const text = 'SELECT * FROM players WHERE agent_id = $1';
  const result = await query<Player>(text, [agentId]);
  return result.rows[0] || null;
}

/**
 * Get player by ID
 */
export async function getPlayerById(id: number): Promise<Player | null> {
  const text = 'SELECT * FROM players WHERE id = $1';
  const result = await query<Player>(text, [id]);
  return result.rows[0] || null;
}

/**
 * Update player
 */
export async function updatePlayer(
  id: number,
  updates: Partial<Omit<Player, 'id' | 'created_at'>>
): Promise<Player> {
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

  values.push(id);

  const text = `
    UPDATE players
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await query<Player>(text, values);
  return result.rows[0];
}

/**
 * List all players (with pagination)
 */
export async function listPlayers(
  page: number = 1,
  pageSize: number = 20
): Promise<{ players: Player[]; total: number; page: number; pageSize: number; totalPages: number }> {
  const offset = (page - 1) * pageSize;

  const countText = 'SELECT COUNT(*) FROM players';
  const countResult = await query<{ count: string }>(countText, []);
  const total = parseInt(countResult.rows[0].count);

  const dataText = 'SELECT * FROM players ORDER BY total_wealth DESC LIMIT $1 OFFSET $2';
  const dataResult = await query<Player>(dataText, [pageSize, offset]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    players: dataResult.rows,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Update credit rating
 */
export async function updateCreditRating(
  playerId: number,
  newRating: 'A' | 'B' | 'C' | 'D'
): Promise<Player> {
  return updatePlayer(playerId, { credit_rating: newRating });
}

/**
 * Update credit points
 */
export async function updateCreditPoints(
  playerId: number,
  amount: number,
  operation: 'add' | 'subtract'
): Promise<Player> {
  const player = await getPlayerById(playerId);
  if (!player) {
    throw new Error('Player not found');
  }

  const newAmount = operation === 'add'
    ? player.credit_points + amount
    : player.credit_points - amount;

  return updatePlayer(playerId, { credit_points: newAmount });
}

/**
 * Mark player as bankrupt
 */
export async function markBankrupt(playerId: number): Promise<Player> {
  return updatePlayer(playerId, { is_bankrupt: true });
}
