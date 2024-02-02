import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { z } from 'zod'
import { UserAssets, userAssetsSchema, HistoricalData } from './index'

@Entity()
export class Asset {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column('text')
  name: string

  @Column('text')
  ticker: string

  @Column('decimal')
  current_price: number

  @OneToMany(() => HistoricalData, (historicalData) => historicalData.asset)
  historicalData: HistoricalData[]

  @OneToMany(() => UserAssets, (userAssets) => userAssets.asset, {
    cascade: true,
  })
  userAssets: UserAssets[]
}

export const assetSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(3).max(20),
  ticker: z.string().min(3).max(6),
  userAssets: z.array(userAssetsSchema),
  current_price: z.number().int().positive(),
})

export type AssetInsert = Omit<Asset, 'id'>

export const assetInsertSchema = assetSchema.omit({ id: true })
