import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { z } from 'zod'
import { NumericTransformer } from '../utils/generalUtils'
import { User, Asset } from './index'

export enum TransactionType {
  BUY = 'buy',
  SELL = 'sell',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('increment')
  id!: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset!: Asset

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  transactionType!: TransactionType

  @Column({
    type: 'decimal',
    precision: 10, // Adjust precision
    scale: 2, // Adjust scale
    transformer: new NumericTransformer(),
    default: 0,
  })
  quantity!: number

  @Column('decimal')
  price!: number

  @Column('date')
  transaction_date!: Date
}

export const transactionSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  asset_id: z.number().int().positive(),
  transaction_type: z.string().min(3).max(20),
  quantity: z.number(),
  price: z.number().int().positive(),
  transaction_date: z.date(),
})

export type TransactionInsert = Omit<Transaction, 'id'>

export const transactionInsertSchema = transactionSchema.omit({ id: true })
