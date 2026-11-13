import { expect, test, type Page } from '@playwright/test'

// The API runs with MARKET_DATA=static, so prices are the same on every run:
// BTC $60,000 and ETH $3,000 today.

async function recordTrade(
  page: Page,
  type: 'Buy' | 'Sell',
  asset: string,
  quantity: string,
  options: { price?: string } = {}
) {
  await page.goto('/dashboard/asset-manage')
  await page.getByRole('button', { name: type.toLowerCase(), exact: true }).click()
  await page.getByLabel('Asset').fill(asset)
  await page.getByRole('option').first().click()
  await page.getByLabel('Quantity').fill(quantity)
  if (options.price) await page.getByLabel('Price per coin (USD)').fill(options.price)
  else await expect(page.getByLabel('Price per coin (USD)')).not.toHaveValue('')
  await page.getByRole('button', { name: `Record ${type.toLowerCase()}` }).click()
}

test('a new user can sign up, trade and review their portfolio', async ({ page }) => {
  const unique = Date.now().toString(36)
  const username = `e2e_${unique}`

  await test.step('protected pages require a login', async () => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  await test.step('sign up', async () => {
    await page.goto('/signup')
    await page.getByLabel('Email').fill(`${username}@example.com`)
    await page.getByLabel('Username').fill(username)
    await page.getByLabel('Password', { exact: true }).fill('Password123')
    await page.getByLabel('Confirm Password').fill('Password123')
    await page.getByRole('button', { name: 'Sign up' }).click()

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByText('No holdings yet')).toBeVisible()
    await expect(page.getByRole('banner').getByText(username)).toBeVisible()
  })

  await test.step('buy a fractional amount, found by searching for its name', async () => {
    await recordTrade(page, 'Buy', 'bitc', '0.004', { price: '50000' })
    await expect(page.getByRole('status')).toContainText('Bought 0.004 BTC')
  })

  await test.step('an asset the market does not list cannot be recorded', async () => {
    await page.goto('/dashboard/asset-manage')
    await page.getByLabel('Asset').fill('NOPE')
    await expect(page.getByText('No matching assets')).toBeVisible()
    await page.getByLabel('Quantity').fill('1')
    await page.getByLabel('Price per coin (USD)').fill('1')
    await page.getByRole('button', { name: 'Record buy' }).click()
    await expect(page.getByText('Choose an asset from the list')).toBeVisible()
  })

  await test.step('cannot sell more than is owned', async () => {
    await recordTrade(page, 'Sell', 'BTC', '1')
    await expect(page.getByRole('alert')).toContainText('Insufficient balance: you own 0.004 BTC')
  })

  await test.step('the dashboard values the holding and shows the profit', async () => {
    await page.goto('/dashboard')
    // 0.004 BTC at $60,000, bought for $200
    await expect(page.getByTestId('total-value')).toHaveText('$240.00')
    const row = page.getByTestId('holding')
    await expect(row).toHaveCount(1)
    await expect(row).toContainText('BTC')
    await expect(row).toContainText('0.004')
    await expect(row).toContainText('$50,000.00')
    await expect(row).toContainText('+$40.00')
    await expect(row).toContainText('+20.00%')
    await expect(page.getByRole('img', { name: /Portfolio value from/ })).toBeVisible()
  })

  await test.step('the session survives a reload', async () => {
    await page.reload()
    await expect(page.getByRole('banner').getByText(username)).toBeVisible()
    await expect(page.getByTestId('total-value')).toHaveText('$240.00')
  })

  await test.step('edit a transaction', async () => {
    await page.goto('/dashboard/transactions')
    await page.getByRole('button', { name: 'Edit buy of BTC' }).click()
    const dialog = page.getByRole('dialog', { name: 'Edit transaction' })
    await dialog.getByLabel('Quantity').fill('0.01')
    await dialog.getByRole('button', { name: 'Save changes' }).click()
    await expect(dialog).toBeHidden()
    // 0.01 BTC at the $50,000 paid
    await expect(page.locator('tbody tr').first()).toContainText('$500.00')
  })

  await test.step('sell the whole holding from the dashboard', async () => {
    await page.goto('/dashboard')
    await page.getByRole('link', { name: 'Sell BTC' }).click()
    await expect(page.getByLabel('Asset')).toHaveValue('BTC')
    await expect(page.getByRole('button', { name: 'sell', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await page.getByLabel('Quantity').fill('0.01')
    await expect(page.getByLabel('Price per coin (USD)')).toHaveValue('60000')
    await page.getByRole('button', { name: 'Record sell' }).click()
    await expect(page.getByRole('status')).toContainText('Sold 0.01 BTC')

    await page.goto('/dashboard')
    await expect(page.getByTestId('total-value')).toHaveText('$0.00')
    // Sold 0.01 BTC for $600 that cost $500
    await expect(page.getByText('+$100.00')).toBeVisible()
  })

  await test.step('transaction history lists, filters and deletes', async () => {
    await page.goto('/dashboard/transactions')
    const rows = page.locator('tbody tr')
    await expect(rows).toHaveCount(2)
    await expect(rows.first()).toContainText('sell')

    await page.getByRole('button', { name: 'buy', exact: true }).click()
    await expect(rows).toHaveCount(1)

    // The buy cannot go while the sale that depends on it remains
    await page.getByRole('button', { name: 'Delete buy of BTC' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(dialog.getByRole('alert')).toContainText('Delete that sale first')
    await dialog.getByRole('button', { name: 'Cancel' }).click()

    await page.getByRole('button', { name: 'all', exact: true }).click()
    await page.getByRole('button', { name: 'Delete sell of BTC' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(rows).toHaveCount(1)
  })

  await test.step('log out and back in', async () => {
    await page.getByRole('button', { name: 'Open user menu' }).click()
    await page.getByRole('menuitem', { name: 'Sign out' }).click()
    await expect(page).toHaveURL(/\/login$/)

    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)

    await page.getByLabel('Username or Email').fill(username.toUpperCase())
    await page.getByLabel('Password').fill('Password123')
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
  })
})

test('the demo opens a ready-made portfolio without signing up', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Try the demo' }).click()

  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByText('Demo account')).toBeVisible()
  await expect(page.getByTestId('holding')).toHaveCount(5)
  await expect(page.getByTestId('total-value')).not.toHaveText('$0.00')

  await page.goto('/dashboard/transactions')
  await expect(page.locator('tbody tr')).toHaveCount(13)
})

test('login shows a clear message for wrong credentials', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Username or Email').fill('nobody-here')
  await page.getByLabel('Password').fill('WrongPassword1')
  await page.getByRole('button', { name: 'Log in' }).click()

  await expect(page.getByTestId('errorMessage')).toHaveText('Invalid credentials')
})

test('settings: rename, change password and delete the account', async ({ page }) => {
  const username = `e2e_set_${Date.now().toString(36)}`
  await page.goto('/signup')
  await page.getByLabel('Email').fill(`${username}@example.com`)
  await page.getByLabel('Username').fill(username)
  await page.getByLabel('Password', { exact: true }).fill('Password123')
  await page.getByLabel('Confirm Password').fill('Password123')
  await page.getByRole('button', { name: 'Sign up' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)

  await page.getByRole('link', { name: 'Settings' }).first().click()
  await expect(page.getByLabel('Username')).toHaveValue(username)

  await test.step('rename', async () => {
    await page.getByLabel('Username').fill(`${username}_x`)
    await page.getByRole('button', { name: 'Save profile' }).click()
    await expect(page.getByText('Profile updated.')).toBeVisible()
    await expect(page.getByRole('banner').getByText(`${username}_x`)).toBeVisible()
  })

  await test.step('change password', async () => {
    await page.getByLabel('Current password').fill('WrongPassword1')
    await page.getByLabel('New password', { exact: true }).fill('NewPassword456')
    await page.getByLabel('Confirm new password').fill('NewPassword456')
    await page.getByRole('button', { name: 'Change password' }).click()
    await expect(page.getByText('Current password is incorrect')).toBeVisible()

    await page.getByLabel('Current password').fill('Password123')
    await page.getByRole('button', { name: 'Change password' }).click()
    await expect(page.getByText('Password changed.')).toBeVisible()
  })

  await test.step('delete the account', async () => {
    await page.getByRole('button', { name: 'Delete my account' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Delete account' }).click()
    await expect(page).toHaveURL(/\/$/)

    await page.goto('/login')
    await page.getByLabel('Username or Email').fill(`${username}_x`)
    await page.getByLabel('Password').fill('NewPassword456')
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page.getByTestId('errorMessage')).toHaveText('Invalid credentials')
  })
})
