import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Player } from './Player';

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  loanId: string;

  @Column({ type: 'integer' })
  playerId: number;

  @Column({ length: 50 })
  loanType: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ type: 'integer' })
  durationDays: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  dailyInterest: number;

  @Column({ type: 'bigint' })
  totalRepayment: number;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ type: 'bigint', default: 0 })
  repaidAmount: number;

  @Column({ length: 50, default: 'active' })
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Player, player => player.loans)
  player: Player;

  // Methods
  async isOverdue(): Promise<boolean> {
    return new Date() > this.dueDate && this.status === 'active';
  }

  async getRemainingBalance(): Promise<number> {
    return this.totalRepayment - this.repaidAmount;
  }

  async markAsPaid() {
    this.status = 'paid';
    this.repaidAmount = this.totalRepayment;
    await this.save();
  }

  async markAsDefault() {
    this.status = 'default';
    await this.save();
  }

  async addInterest(days: number = 1) {
    const interest = Math.ceil(this.dailyInterest * days);
    this.repaidAmount += interest;
    await this.save();
  }

  async isFullyPaid(): Promise<boolean> {
    return this.repaidAmount >= this.totalRepayment;
  }
}
