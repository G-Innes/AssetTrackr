import { getRepository } from 'typeorm'
import bcrypt from 'bcrypt'
import { User } from '../entities/user'
import { Asset } from '../entities/asset'
import { UserAssets } from '../entities/userAssets'
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
