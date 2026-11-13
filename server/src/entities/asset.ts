import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Transaction } from './transaction'

@Entity('asset')
export class Asset {
  @PrimaryGeneratedColumn('increment')
  id!: number

  // Always stored upper case, e.g. "BTC"
  @Column({ type: 'text', unique: true })
  ticker!: string

  @Column({ type: 'text' })
  name!: string

  @OneToMany(() => Transaction, (transaction) => transaction.asset)
  transactions?: Transaction[]
}
