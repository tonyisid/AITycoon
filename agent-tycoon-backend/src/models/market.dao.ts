/**
 * Market Data Access Object
 */

import { query } from '../config/database-connection';

export interface MarketPrice {
  id: number;
  item_type: string;
  base_price: number;
  current_price: number;
  total_demand: number;
  total_supply: number;
  price_trend: 'rising' | 'falling' | 'stable' | 'volatile';
  market_sentiment: number;
  price_history: number[];
  updated_at: Date;
}

/**
 * Get market price by item type
 */
export async function getMarketPrice(itemType: string): Promise<MarketPrice | null> {
  const text = 'SELECT * FROM market_prices WHERE item_type = $1';
  const result = await query<MarketPrice>(text, [itemType]);
  return result.rows[0] || null;
}

/**
 * List all market prices
 */
export async function listMarketPrices(): Promise<MarketPrice[]> {
  const text = 'SELECT * FROM market_prices ORDER BY item_type';
  const result = await query<MarketPrice>(text, []);
  return result.rows;
}

/**
 * Update market price
 */
export async function updateMarketPrice(
  itemType: string,
  updates: Partial<Omit<MarketPrice, 'id' | 'created_at' | 'item_type'>>
): Promise<MarketPrice> {
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

  values.push(itemType);

  const text = `
    UPDATE market_prices
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE item_type = $${paramIndex}
    RETURNING *
  `;

  const result = await query<MarketPrice>(text, values);
  return result.rows[0];
}

/**
 * Calculate new price based on supply and demand
 */
export async function calculatePrice(
  itemType: string,
  totalDemand: number,
  totalSupply: number
): Promise<number> {
  const marketPrice = await getMarketPrice(itemType);
  
  if (!marketPrice) {
    return 100; // Default price
  }

  // Price = base_price * (demand / supply)
  const ratio = totalSupply > 0 ? totalDemand / totalSupply : 1;
  let newPrice = Math.floor(marketPrice.base_price * ratio);

  // Add random fluctuation (±20%)
  const fluctuation = (Math.random() - 0.5) * 0.4; // ±20%
  newPrice = Math.floor(newPrice * (1 + fluctuation));

  // Ensure price is positive
  newPrice = Math.max(1, newPrice);

  // Update price history (keep last 100)
  const priceHistory = [...(marketPrice.price_history || []), newPrice].slice(-100);

  // Determine trend
  let trend: 'rising' | 'falling' | 'stable' | 'volatile';
  if (priceHistory.length >= 2) {
    const lastPrice = priceHistory[priceHistory.length - 2];
    if (newPrice > lastPrice * 1.05) trend = 'rising';
    else if (newPrice < lastPrice * 0.95) trend = 'falling';
    else trend = 'stable';
  } else {
    trend = 'stable';
  }

  // Calculate market sentiment
  const sentiment = ratio > 1.2 ? 1.2 : ratio < 0.8 ? 0.8 : 1.0;

  // Update database
  await updateMarketPrice(itemType, {
    current_price: newPrice,
    total_demand: totalDemand,
    total_supply: totalSupply,
    price_trend: trend,
    market_sentiment: sentiment,
    price_history: priceHistory,
  });

  return newPrice;
}

/**
 * Initialize market prices
 */
export async function initializeMarketPrices(): Promise<void> {
  const items = [
    { type: 'electricity', basePrice: 1 },
    { type: 'water', basePrice: 5 },
    { type: 'food', basePrice: 500 },
    { type: 'clothing', basePrice: 50 },
    { type: 'housing', basePrice: 100000 },
    { type: 'car', basePrice: 50000 },
    { type: 'battery', basePrice: 10 },
    { type: 'construction_material', basePrice: 100 },
    { type: 'computing_power', basePrice: 1000 },
  ];

  for (const item of items) {
    const existing = await getMarketPrice(item.type);
    if (!existing) {
      await query(`
        INSERT INTO market_prices (item_type, base_price, current_price, total_demand, total_supply, price_trend, market_sentiment, price_history)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        item.type,
        item.basePrice,
        item.basePrice,
        1000, // Initial demand
        1000, // Initial supply
        'stable',
        1.0,
        '[]',
      ]);
    }
  }
}
