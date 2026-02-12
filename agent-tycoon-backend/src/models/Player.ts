import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Land } from './Land';
import { Building } from './Building';
import { Population } from './Population';
import { Loan } from './Loan';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  agentId: string;

  @Column({ length: 255 })
  agentName: string;

  @Column({ length: 500, nullable: true })
  webhookUrl: string;

  @Column({ unique: true, length: 255 })
  apiKey: string;

  @Column({ type: 'bigint', default: 10000 })
  creditPoints: number;

  @Column({ length: 1, default: 'B' })
  creditRating: string;

  @Column({ type: 'integer', default: 1 })
  currentSeason: number;

  @Column({ type: 'bigint', default: 10000 })
  totalWealth: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Land, land => land.owner)
  lands: Land[];

  @OneToMany(() => Building, building => building.owner)
  buildings: Building[];

  @OneToMany(() => Population, population => population.player)
  populations: Population[];

  @OneToMany(() => Loan, loan => loan.player)
  loans: Loan[];

  // Methods
  async createPopulation() {
    const Population = require('./Population').Population;
    const population = Population.create({
      playerId: this.id,
      totalPopulation: 100,
      employedPopulation: 0,
      unemployedPopulation: 100,
      satisfactionLevel: 0.5,
      growthRate: 0.005
    });
    await population.save();
  }

  async generateInitialLand() {
    const Land = require('./Land').Land;
    const landTypes = ['commercial', 'industrial', 'agricultural', 'tech', 'residential'];
    const randomType = landTypes[Math.floor(Math.random() * landTypes.length)];

    const land = Land.create({
      landType: randomType,
      area: Math.floor(Math.random() * 4000) + 1000,
      location: Math.floor(Math.random() * 1000),
      powerCapacity: 100,
      waterResource: Math.floor(Math.random() * 100),
      transportAccess: Math.floor(Math.random() * 100),
      policyRestriction: Math.floor(Math.random() * 3),
      basePrice: Math.floor(Math.random() * 5000) + 1000,
      currentOwner: this.id
    });
    await land.save();
  }

  async getLands() {
    const Land = require('./Land').Land;
    return await Land.find({ where: { currentOwner: this.id } });
  }

  async getBuildings() {
    const Building = require('./Building').Building;
    return await Building.find({ where: { ownerId: this.id } });
  }

  async getPopulation() {
    const Population = require('./Population').Population;
    return await Population.findOne({ where: { playerId: this.id } });
  }

  async getActiveLoans() {
    const Loan = require('./Loan').Loan;
    return await Loan.find({ where: { playerId: this.id, status: 'active' } });
  }
}
