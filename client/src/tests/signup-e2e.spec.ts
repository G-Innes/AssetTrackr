import { test, expect } from '@playwright/test';

test('should successfully sign up a new user', async ({ page }) => {

  await page.route('**/*', (route, request) => {
    console.log(request.url());
    route.continue();
  });
  // Navigate to the signup page
  await page.goto('http://localhost:5173/signup');


  // Wait for the form to be visible
  await page.waitForSelector('form');

  // Attempt to fill the email input field using a generic selector
  await page.fill('form input[type="email"]:first-of-type', 'test@example.com');

  // Fill rest of form
  await page.fill('form input[type="text"]:first-of-type', 'testuser');
  await page.fill('form input[type="password"]:first-of-type', 'Password123!');
  await page.fill('form input[type="password"]:nth-of-type(2)', 'Password123');

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for the success message to appear
  await expect(page.locator('[data-testid="successMessage"]')).toContainText('You have successfully signed up You can now log in.');
});