import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Player } from './Player';

@Entity('population')
export class Population {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  playerId: number;

  @Column({ type: 'integer', default: 100 })
  totalPopulation: number;

  @Column({ type: 'integer', default: 0 })
  employedPopulation: number;

  @Column({ type: 'integer', default: 100 })
  unemployedPopulation: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.5 })
  satisfactionLevel: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.005 })
  growthRate: number;

  @Column({ type: 'integer', default: 100 })
  dailyFoodConsumption: number;

  @Column({ type: 'integer', default: 10 })
  dailyClothingConsumption: number;

  @Column({ type: 'integer', default: 1 })
  dailyHousingConsumption: number;

  @Column({ type: 'integer', default: 5 })
  dailyEntertainmentConsumption: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Player, player => player.populations)
  player: Player;

  // Methods
  async updateDailyConsumption() {
    const CONSTANTS = require('../utils/constants').CONSTANTS;

    this.dailyFoodConsumption = this.totalPopulation * CONSTANTS.DAILY_FOOD_CONSUMPTION_PER_PERSON;
    this.dailyClothingConsumption = this.totalPopulation * CONSTANTS.DAILY_CLOTHING_CONSUMPTION_PER_PERSON;
    this.dailyHousingConsumption = this.totalPopulation * CONSTANTS.DAILY_HOUSING_CONSUMPTION_PER_PERSON;
    this.dailyEntertainmentConsumption = this.totalPopulation * CONSTANTS.DAILY_ENTERTAINMENT_CONSUMPTION_PER_PERSON;

    await this.save();
  }

  async calculateSatisfaction() {
    const CONSTANTS = require('../utils/constants').CONSTANTS;
    const totalConsumption = this.dailyFoodConsumption + this.dailyClothingConsumption + this.dailyHousingConsumption + this.dailyEntertainmentConsumption;
    const requiredConsumption = this.totalPopulation * (CONSTANTS.DAILY_FOOD_CONSUMPTION_PER_PERSON + CONSTANTS.DAILY_CLOTHING_CONSUMPTION_PER_PERSON + CONSTANTS.DAILY_HOUSING_CONSUMPTION_PER_PERSON + CONSTANTS.DAILY_ENTERTAINMENT_CONSUMPTION_PER_PERSON);

    return totalConsumption / requiredConsumption;
  }

  async growPopulation() {
    const growth = Math.floor(this.totalPopulation * this.growthRate);
    this.totalPopulation += growth;
    this.unemployedPopulation += growth;
    await this.save();
  }

  async losePopulation(reason: string) {
    const loss = Math.floor(this.totalPopulation * CONSTANTS.POPULATION_LOSS_RATE);

    if (reason === 'food') {
      this.totalPopulation -= loss * 2; // Double loss for food shortage
    } else {
      this.totalPopulation -= loss;
    }

    this.employedPopulation = Math.min(this.employedPopulation, this.totalPopulation);
    this.unemployedPopulation = this.totalPopulation - this.employedPopulation;

    await this.save();
  }
}
