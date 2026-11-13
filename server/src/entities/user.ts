import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Transaction } from './transaction'

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('increment')
  id!: number

  @Column({ type: 'text' })
  username!: string

  @Column({ type: 'text' })
  email!: string

  // bcrypt hash. `select: false` keeps it out of every query that does not
  // ask for it explicitly, so it cannot leak into a response by accident.
  @Column({ name: 'password', type: 'text', select: false })
  passwordHash!: string

  // A throwaway account created by "Try the demo"; purged after a day
  @Column({ name: 'is_demo', type: 'boolean', default: false })
  isDemo!: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions?: Transaction[]
}
