const { test, expect } = require('@playwright/test');
const { handleReCaptcha } = require('../utils/recaptchaHandler');

test.describe('Form Submission Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://search.permission.io');
    await page.getByRole('button', { name: 'Accept All' }).click();
    await page.getByRole('button', { name: 'Log in' }).click();
  });

  test('Login button disabled if only password is filled', async ({ page }) => {
    await page.getByPlaceholder('Enter your email').click();
    await page.fill('#password', process.env.PASSWORD);
    const isDisabled = await page.isDisabled('[name="login"]');
    expect(isDisabled).toBe(true);
  });

  test('Login button disabled if only email is filled', async ({ page }) => {
    await page.fill('#username', process.env.EMAIL);
    await page.getByPlaceholder('••••••••').click();
    const isDisabled = await page.isDisabled('[name="login"]');
    expect(isDisabled).toBe(true);
  });

  test('Error message if ReCaptcha is skipped', async ({ page }) => {
    await page.fill('#username', process.env.EMAIL);
    await page.fill('#password', process.env.PASSWORD);
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page.locator('#kc-content-wrapper div').filter({ hasText: 'Invalid Recaptcha' })).toBeVisible();
  });

  test('Successful form submission', async ({ page }) => {
    await page.fill('#username', process.env.EMAIL);
    await page.fill('#password', process.env.PASSWORD);
    await handleReCaptcha(page); // ReCaptcha handling
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL('https://search.permission.io/earn');
    await page.getByRole('banner').getByRole('button').click();
    await page.locator('.px-2 > div > .lucide').click();
    await expect(page).toHaveURL('https://search.permission.io/?logout=success');
  });
});