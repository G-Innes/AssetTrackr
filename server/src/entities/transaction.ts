import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Asset } from './asset'
import { User } from './user'

export enum TransactionType {
  BUY = 'buy',
  SELL = 'sell',
}

// The transaction ledger is the single source of truth: a user's holdings are
// always derived from it, never stored separately.
@Entity('transaction')
@Index(['userId', 'assetId'])
export class Transaction {
  @PrimaryGeneratedColumn('increment')
  id!: number

  @Column({ name: 'user_id', type: 'integer' })
  userId!: number

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User

  @Column({ name: 'asset_id', type: 'integer' })
  assetId!: number

  @ManyToOne(() => Asset, (asset) => asset.transactions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'asset_id' })
  asset?: Asset

  @Column({ type: 'enum', enum: TransactionType, enumName: 'transaction_type' })
  type!: TransactionType

  // Quantities and prices are numeric(36,18) and travel as strings so that
  // small crypto amounts (0.00012345 BTC) never pass through a JS float.
  @Column({ type: 'numeric', precision: 36, scale: 18 })
  quantity!: string

  // Price of one unit in USD at the time of the trade
  @Column({ type: 'numeric', precision: 36, scale: 18 })
  price!: string

  @Column({ name: 'executed_at', type: 'timestamptz' })
  executedAt!: Date

  @Column({ type: 'text', nullable: true })
  note!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date
}
