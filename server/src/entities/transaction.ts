import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { z } from 'zod'
import { User } from './user'
import { Asset } from './asset'

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset

  @Column('text')
  transaction_type: string

  @Column('decimal')
  quantity: number

  @Column('decimal')
  price: number

  @Column('date')
  transaction_date: Date
}

export const transactionSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  asset_id: z.number().int().positive(),
  transaction_type: z.string().min(3).max(20),
  quantity: z.number().int().positive(),
  price: z.number().int().positive(),
  transaction_date: z.date(),
})

export type TransactionInsert = Omit<Transaction, 'id'>

export const transactionInsertSchema = transactionSchema.omit({ id: true })
