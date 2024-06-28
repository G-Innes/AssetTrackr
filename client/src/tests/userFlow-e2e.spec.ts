import { test, expect } from '@playwright/test';

test.describe('User Authentication Flow', () => {
  test('should successfully sign up a new user', async ({ page }) => {
    await page.goto('http://localhost:5173/signup');
    await page.waitForSelector('form');
    await page.fill('form input[type="email"]', 'test@example.com');
    await page.fill('form input[type="text"]', 'testuser');
    await page.fill('form input[type="password"]', 'Password123!');
    await page.fill('form input[type="password"]', 'Password123!');
    await page.click('form button[type="submit"]');
    await page.goto('/login');
    expect(await page.url()).toBe('http://localhost:5173/login');
  });

  test('should successfully log in a user', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('form input[type="text"]', 'grant');
    await page.fill('form input[type="password"]', 'Password123!');
    await page.click('form button[type="submit"]');
    await page.waitForNavigation();
    await expect(page).toHaveURL(/\/home|\/dashboard/);
  });
});

test.describe('Asset Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('form input[type="text"]', 'grant');
    await page.fill('form input[type="password"]', 'Password123!');
    await page.click('form button[type="submit"]');
    await page.waitForNavigation();
    await expect(page).toHaveURL(/\/home|\/dashboard/);
  });

  test('should successfully buy an asset', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard/asset-manage');
    await page.waitForSelector('input[name="quantity"]');
    await page.fill('input[name="quantity"]', '0.5');
    await page.fill('input[name="name"]', 'Bitcoin');
    await page.fill('input[name="ticker"]', 'BTC');
    await page.click('button:has-text("Buy")');
    await page.waitForSelector('.PLS', { state: 'visible' });
    const alertMessage = await page.textContent('.fixed.top-0.left-0.w-full.p-4.text-white.bg-green-600.text-center.text-2xl');
    expect(alertMessage).toBe('Transaction Complete!');
  });

  test('should view a transaction', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard/transactions');
    await page.waitForSelector('.memphis-card');
    const transactions = await page.$$('.memphis-card');
    expect(transactions.length).toBeGreaterThan(0);
  });

  test('should view holdings on the dashboard', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForSelector('.PLS');
    const holdings = await page.$$('.PLS');
    expect(holdings.length).toBeGreaterThan(0);
  });

  test('should successfully sell an asset', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard/asset-manage');
    await page.waitForSelector('input[name="quantity"]');
    await page.fill('input[name="quantity"]', '0.5');
    await page.fill('input[name="name"]', 'Bitcoin');
    await page.fill('input[name="ticker"]', 'BTC');
    await page.click('button:has-text("Sell")');
    await page.waitForSelector('.PLS', { state: 'visible' });
    const alertMessage = await page.textContent('.fixed.top-0.left-0.w-full.p-4.text-white.bg-green-600.text-center.text-2xl');
    expect(alertMessage).toBe('Transaction Complete!');
  });

  test('should view no holdings on the dashboard', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    // Wait for the alert to appear
    await page.waitForSelector('.text-black-bold');
    const holdings = await page.$$('.PLS');
    expect(holdings.length).toBe(0);
  });

  test('should log out the user', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    await page.click('.PLSB');
    await page.waitForSelector('form');
    expect(await page.url()).toBe('http://localhost:5173/login');
  });
});
