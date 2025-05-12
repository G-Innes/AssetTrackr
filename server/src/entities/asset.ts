import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { z } from 'zod'
import { UserAssets } from './userAssets'

@Entity()
export class Asset {
  @PrimaryGeneratedColumn('increment')
  id!: number

  @Column({ type: 'integer', nullable: true })
  assetId!: number

  @Column('text')
  name!: string

  @Column('text')
  ticker!: string

  @Column('decimal')
  current_price!: number

  @OneToMany(() => UserAssets, (userAssets) => userAssets.asset, {
    cascade: true,
  })
  userAssets!: UserAssets[]
}

export const assetSchema = z.object({
  id: z.number().int().positive(),
  assetId: z.number().int().positive(),
  name: z.string().min(3).max(20),
  ticker: z.string().min(3).max(6),
  userAssets: z.array(z.lazy(() => z.object({
    id: z.number().int().positive(),
    quantity: z.number().positive(),
  }))),
  current_price: z.number().positive(),
})

export type AssetInsert = Omit<Asset, 'id'>

export const assetInsertSchema = assetSchema.omit({ id: true })
