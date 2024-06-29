import { getRepository } from 'typeorm'
import bcrypt from 'bcrypt'
import { User } from '../entities/user'
import { Asset } from '../entities/asset'
import { UserAssets } from '../entities/userAssets'
import { Transaction, TransactionType } from '../entities/transaction'
import config from '../config'

// function for creating a user for tests
export async function createTestUser() {
  const userRepository = getRepository(User)
  const user = new User()
  const timestamp = Date.now()
  user.username = `Test User ${timestamp}`
  user.email = `testuser${timestamp}@example.com`
  user.password = await bcrypt.hash('password', config.auth!.passwordCost)
  await userRepository.save(user)
  return user
}

// function for creating test asset
export async function createTestAsset() {
  const assetRepository = getRepository(Asset)
  const asset = new Asset()
  asset.assetId = 1
  asset.name = 'Test Asset'
  asset.ticker = 'TST'
  asset.current_price = 100
  await assetRepository.save(asset)
  return asset
}

export async function createTestUserAsset(
  user: User,
  asset: Asset,
  quantity: number
) {
  const userAssetsRepository = getRepository(UserAssets)
  const userAsset = new UserAssets()
  userAsset.user = user
  userAsset.asset = asset
  userAsset.quantity = quantity
  await userAssetsRepository.save(userAsset)
  return userAsset
}

export async function createTestTransaction(
  user: User,
  asset: Asset,
  assetId: number,
  type: TransactionType
) {
  const transactionRepository = getRepository(Transaction)
  const transaction = new Transaction()

  transaction.user = user
  transaction.assetId = asset.assetId
  transaction.asset = asset
  transaction.transactionType = type
  transaction.quantity = 10
  transaction.price = 100
  transaction.transaction_date = new Date()

  await transactionRepository.save(transaction)
  return transaction
}
