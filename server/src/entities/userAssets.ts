import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm'
import { z } from 'zod'
import { NumericTransformer } from '../utils/generalUtils'
import { User } from './user'
import { Asset } from './asset'

@Entity()
export class UserAssets {
  @PrimaryGeneratedColumn('increment')
  id!: number

  @ManyToOne(() => User, (user) => user.userAssets)
  user!: User

  @ManyToOne(() => Asset, (asset) => asset.userAssets)
  asset!: Asset

  @Column({
    type: 'decimal', // Change the type
    precision: 10, // Adjust precision
    scale: 2, // Adjust scale
    transformer: new NumericTransformer(),
    default: 0,
  })
  quantity!: number
}

export const userAssetsSchema = z.object({
  id: z.number().int().positive(),
  quantity: z.number().positive(),
})

export type UserAssetInsert = Omit<UserAssets, 'id'>

export const userAssetInsertSchema = userAssetsSchema.omit({ id: true })
