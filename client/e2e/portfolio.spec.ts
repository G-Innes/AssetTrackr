import { expect, test, type Page } from '@playwright/test'

// Live prices come from Coinbase; pin them so the test is deterministic.
const PRICES: Record<string, string> = { BTC: '60000', ETH: '3000' }

async function mockPrices(page: Page) {
  await page.route('**/api.coinbase.com/v2/exchange-rates**', (route) => {
    const ticker = new URL(route.request().url()).searchParams.get('currency') ?? ''
    const price = PRICES[ticker]
    return price
      ? route.fulfill({ json: { data: { currency: ticker, rates: { USD: price } } } })
      : route.fulfill({ status: 400, json: { errors: [{ id: 'invalid_request' }] } })
  })
}

async function trade(page: Page, action: 'Buy' | 'Sell', ticker: string, quantity: string) {
  await page.goto('/dashboard/asset-manage')
  await page.getByLabel('Ticker Symbol').fill(ticker)
  await page.getByLabel('Quantity').fill(quantity)
  await page.getByRole('button', { name: action, exact: true }).click()
}

test('a new user can sign up, trade and review their portfolio', async ({ page }) => {
  const unique = Date.now().toString(36)
  const username = `e2e_${unique}`
  await mockPrices(page)

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
    await expect(page.getByText('No assets yet')).toBeVisible()
    await expect(page.getByRole('banner').getByText(username)).toBeVisible()
  })

  await test.step('buy a fractional amount', async () => {
    await trade(page, 'Buy', 'btc', '0.004')
    await expect(page.getByRole('status')).toHaveText('Bought 0.004 BTC')
  })

  await test.step('an unknown ticker is rejected instead of recorded at $0', async () => {
    await trade(page, 'Buy', 'NOPE', '1')
    await expect(page.getByText('No live price found for NOPE')).toBeVisible()
  })

  await test.step('cannot sell more than is owned', async () => {
    await trade(page, 'Sell', 'BTC', '1')
    await expect(page.getByRole('alert')).toContainText('Insufficient balance: you own 0.004 BTC')
  })

  await test.step('the dashboard shows the holding at the live price', async () => {
    await page.goto('/dashboard')
    await expect(page.getByText('0.004 BTC')).toBeVisible()
    // 0.004 BTC x $60,000
    await expect(page.getByText('$240.00').first()).toBeVisible()
  })

  await test.step('the session survives a reload', async () => {
    await page.reload()
    await expect(page.getByRole('banner').getByText(username)).toBeVisible()
    await expect(page.getByText('0.004 BTC')).toBeVisible()
  })

  await test.step('sell the whole holding', async () => {
    await page.getByRole('button', { name: 'Sell', exact: true }).click()
    await expect(page.getByLabel('Ticker Symbol')).toHaveValue('BTC')
    await page.getByLabel('Quantity').fill('0.004')
    await page.getByRole('button', { name: 'Sell', exact: true }).click()
    await expect(page.getByRole('status')).toHaveText('Sold 0.004 BTC')

    await page.goto('/dashboard')
    await expect(page.getByText('No assets yet')).toBeVisible()
  })

  await test.step('transaction history lists and filters both trades', async () => {
    await page.goto('/dashboard/transactions')
    const rows = page.locator('tbody tr')
    await expect(rows).toHaveCount(2)
    await expect(rows.first()).toContainText('sell')

    await page.getByRole('button', { name: 'buy', exact: true }).click()
    await expect(rows).toHaveCount(1)
    await expect(rows.first()).toContainText('$240.00')
  })

  await test.step('log out and back in', async () => {
    await page.getByRole('button', { name: 'Open user menu' }).click()
    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page).toHaveURL(/\/login$/)

    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)

    await page.getByLabel('Username or Email').fill(username.toUpperCase())
    await page.getByLabel('Password').fill('Password123')
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
  })
})

test('login shows a clear message for wrong credentials', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Username or Email').fill('nobody-here')
  await page.getByLabel('Password').fill('WrongPassword1')
  await page.getByRole('button', { name: 'Log in' }).click()

  await expect(page.getByTestId('errorMessage')).toHaveText('Invalid credentials')
})
