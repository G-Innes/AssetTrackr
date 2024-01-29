import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { z } from 'zod'
import { Asset } from './index'

@Entity()
export class HistoricalData {
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset

  @Column('text')
  price: number

  @Column('date')
  timestamp: Date
}

export const historicalDataSchema = z.object({
  id: z.number().int().positive(),
  asset_id: z.number().int().positive(),
  price: z.number().int().positive(),
  timestamp: z.date(),
})

export type HistoricalDataInsert = Omit<HistoricalData, 'id'>

export const historicalDataInsertSchema = historicalDataSchema.omit({
  id: true,
})
// possiblely add this in the future
// @Column('text')
// ticker: string

// @Column('date')
// date: Date

// @Column('decimal')
// open: number

// @Column('decimal')
// high: number

// @Column('decimal')
// low: number

// @Column('decimal')
// close: number

// @Column('decimal')
// volume: number
