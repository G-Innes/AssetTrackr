import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm'
import { z } from 'zod'
import { User, Asset } from './index'

@Entity()
export class UserAssets {
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(() => User, (user) => user.userAssets)
  user: User

  @ManyToOne(() => Asset, (asset) => asset.userAssets)
  asset: Asset

  @Column('decimal')
  quantity: number
}

export const userAssetsSchema = z.object({
  id: z.number().int().positive(),
  quantity: z.number().int().positive(),
})

export type UserAssetInsert = Omit<UserAssets, 'id'>

export const userAssetInsertSchema = userAssetsSchema.omit({ id: true })
