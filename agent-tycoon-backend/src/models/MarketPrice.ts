import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('market_prices')
export class MarketPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  itemType: string;

  @Column({ type: 'bigint' })
  basePrice: number;

  @Column({ type: 'bigint' })
  currentPrice: number;

  @Column({ type: 'bigint', default: 0 })
  totalDemand: number;

  @Column({ type: 'bigint', default: 0 })
  totalSupply: number;

  @Column({ length: 20, default: 'stable' })
  priceTrend: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  marketSentiment: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Methods
  async updatePrice() {
    // Calculate supply/demand ratio
    const supplyDemandRatio = this.totalSupply > 0 ? this.totalDemand / this.totalSupply : 1.0;

    // Calculate price adjustment
    let priceAdjustment = 1.0;
    if (supplyDemandRatio > 1.2) {
      priceAdjustment = 0.7; // -30%
    } else if (supplyDemandRatio > 1.0) {
      priceAdjustment = 0.85; // -15%
    } else if (supplyDemandRatio < 0.8) {
      priceAdjustment = 1.2; // +20%
    } else if (supplyDemandRatio < 1.0) {
      priceAdjustment = 1.35; // +35%
    } else if (supplyDemandRatio === 1.0) {
      priceAdjustment = 1.0; // Stable
    }

    // Apply market sentiment
    this.currentPrice = Math.floor(this.basePrice * priceAdjustment * this.marketSentiment);

    // Update price trend
    if (this.currentPrice > this.basePrice * 1.1) {
      this.priceTrend = 'up';
    } else if (this.currentPrice < this.basePrice * 0.9) {
      this.priceTrend = 'down';
    } else {
      this.priceTrend = 'stable';
    }

    await this.save();
  }

  async addDemand(amount: number) {
    this.totalDemand += amount;
    await this.updatePrice();
  }

  async addSupply(amount: number) {
    this.totalSupply += amount;
    await this.updatePrice();
  }
}
