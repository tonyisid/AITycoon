import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Player } from './Player';

@Entity('lands')
export class Land {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  landId: string;

  @Column({ length: 50 })
  landType: string;

  @Column({ type: 'integer' })
  area: number;

  @Column({ type: 'integer' })
  location: number;

  @Column({ type: 'integer', default: 100 })
  powerCapacity: number;

  @Column({ type: 'integer', default: 50 })
  waterResource: number;

  @Column({ type: 'integer', default: 50 })
  transportAccess: number;

  @Column({ type: 'integer', default: 0 })
  policyRestriction: number;

  @Column({ type: 'bigint' })
  basePrice: number;

  @Column({ length: 255, nullable: true })
  auctionId: string;

  @Column({ type: 'bigint', nullable: true })
  currentBid: number;

  @Column({ length: 255, nullable: true })
  highestBidder: string;

  @Column({ type: 'timestamp', nullable: true })
  auctionEnd: Date;

  @Column({ type: 'integer', nullable: true })
  currentOwner: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Player, player => player.lands)
  owner: Player;

  // Methods
  async isAvailable(): Promise<boolean> {
    return this.currentOwner === null && this.auctionId === null;
  }

  async isOwnedBy(playerId: number): Promise<boolean> {
    return this.currentOwner === playerId;
  }
}
