import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { z } from 'zod'
import {
  UserAssets,
  userAssetsSchema,
  Transaction,
  transactionSchema,
} from './index'

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column('text', { unique: true })
  username: string

  @Column('text', { unique: true })
  email: string

  @Column('text')
  password: string

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions?: Transaction[]

  @OneToMany(() => UserAssets, (userAssets) => userAssets.user, {
    cascade: true,
  })
  userAssets?: UserAssets[]
}

export const userSchema = z.object({
  id: z.number().int().positive(),
  username: z.string().min(3).max(20),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(100),
  transactions: z.array(transactionSchema),
  userAssets: z.array(userAssetsSchema),
})

export type UserInsert = Omit<User, 'id'>

export const userInsertSchema = userSchema.omit({ id: true })
