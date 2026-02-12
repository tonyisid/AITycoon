import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Player } from './Player';
import { Land } from './Land';

@Entity('buildings')
export class Building {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  buildingId: string;

  @Column({ type: 'integer' })
  landId: number;

  @Column({ length: 100 })
  buildingType: string;

  @Column({ type: 'integer', default: 1 })
  buildingLevel: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  productionEfficiency: number;

  @Column({ type: 'integer' })
  powerConsumption: number;

  @Column({ type: 'integer', default: 0 })
  workerCount: number;

  @Column({ type: 'timestamp', nullable: true })
  constructionStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  constructionEnd: Date;

  @Column({ type: 'timestamp', nullable: true })
  upgradeStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  upgradeEnd: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Player, player => player.buildings)
  owner: Player;

  @ManyToOne(() => Land, land => land.buildings)
  land: Land;

  // Methods
  async isUnderConstruction(): Promise<boolean> {
    return this.constructionStart !== null && new Date() < this.constructionEnd;
  }

  async isBeingUpgraded(): Promise<boolean> {
    return this.upgradeStart !== null && new Date() < this.upgradeEnd;
  }

  async isOperational(): Promise<boolean> {
    return !await this.isUnderConstruction() && !await this.isBeingUpgraded();
  }

  async getDailyProduction() {
    const CONSTANTS = require('../utils/constants').CONSTANTS;
    const baseProduction = getBaseProduction(this.buildingType);

    return {
      itemType: getProductionItemType(this.buildingType),
      amount: baseProduction * this.productionEfficiency
    };
  }

  async getDailyCost() {
    const CONSTANTS = require('../utils/constants').CONSTANTS;
    const fixedCost = getBuildingFixedCost(this.buildingType);
    const powerCost = this.powerConsumption * 0.1; // 0.1 CP per kWh
    const laborCost = this.workerCount * getWorkerWage(this.buildingType);

    return fixedCost + powerCost + laborCost;
  }
}

// Helper functions
function getBaseProduction(buildingType: string): number {
  const CONSTANTS = require('../utils/constants').CONSTANTS;
  const productionMap: { [key: string]: number } = {
    agriculture: 5,
    mining: 10,
    forestry: 20,
    fishery: 3,
    food_processing: 10,
    machinery_manufacturing: 5,
    textile_clothing: 100,
    chemical: 2,
    software_development: 5,
    retail_commerce: 2000,
    education_training: 100,
    medical_healthcare: 50,
    entertainment_culture: 10,
    energy_electricity: 1000
  };

  return productionMap[buildingType] || 5;
}

function getProductionItemType(buildingType: string): string {
  const itemMap: { [key: string]: string } = {
    agriculture: 'food',
    mining: 'ore',
    forestry: 'wood',
    fishery: 'fish',
    food_processing: 'food',
    machinery_manufacturing: 'machinery',
    textile_clothing: 'clothing',
    chemical: 'chemicals',
    software_development: 'software',
    retail_commerce: 'sales',
    education_training: 'education',
    medical_healthcare: 'healthcare',
    entertainment_culture: 'entertainment',
    energy_electricity: 'electricity'
  };

  return itemMap[buildingType] || 'item';
}

function getBuildingFixedCost(buildingType: string): number {
  const CONSTANTS = require('../utils/constants').CONSTANTS;
  const costMap: { [key: string]: number } = {
    agriculture: 100,
    mining: 150,
    forestry: 80,
    fishery: 120,
    food_processing: 200,
    machinery_manufacturing: 300,
    textile_clothing: 250,
    chemical: 400,
    software_development: 500,
    retail_commerce: 300,
    education_training: 400,
    medical_healthcare: 450,
    entertainment_culture: 350,
    energy_electricity: 600
  };

  return costMap[buildingType] || 100;
}

function getWorkerWage(buildingType: string): number {
  const CONSTANTS = require('../utils/constants').CONSTANTS;
  const wageMap: { [key: string]: number } = {
    agriculture: 20,
    mining: 20,
    forestry: 20,
    fishery: 20,
    food_processing: 30,
    machinery_manufacturing: 30,
    textile_clothing: 30,
    chemical: 30,
    software_development: 50,
    retail_commerce: 30,
    education_training: 50,
    medical_healthcare: 50,
    entertainment_culture: 50,
    energy_electricity: 30
  };

  return wageMap[buildingType] || 20;
}
