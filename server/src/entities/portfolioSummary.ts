import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { z } from 'zod'
import { User } from './index'

@Entity()
export class PortfolioSummary {
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column('decimal')
  total_value: number

  @Column('date')
  last_updated: Date
}

export const portfolioSummarySchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  total_value: z.number().int().positive(),
  last_updated: z.date(),
})

export type PortfolioSummaryInsert = Omit<PortfolioSummary, 'id'>

export const portfolioSummaryInsertSchema = portfolioSummarySchema.omit({
  id: true,
})
