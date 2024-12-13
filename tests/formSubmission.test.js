import { test, expect } from '@playwright/test';
const { handleReCaptcha } = require('../utils/recaptchaHandler');

test.use({ video: 'retain-on-failure' });

test.describe('Form Submission Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://search.permission.io');
    await page.getByRole('button', { name: 'Accept All' }).click();
    await page.getByRole('button', { name: 'Log in' }).click();
  });

  test('Login button disabled if only password is filled', async ({ page }, testInfo) => {
    await page.getByPlaceholder('Enter your email').click();
    await page.fill('#password', process.env.PASSWORD);
    const isDisabled = await page.isDisabled('[name="login"]');
    await testInfo.attach('No email entered.', {
      body: await page.screenshot(),
      contentType: 'image/png',
  });

    expect(isDisabled).toBe(true);
  });

  test('Login button disabled if only email is filled', async ({ page }, testInfo) => {
    await page.fill('#username', process.env.EMAIL);
    await page.getByPlaceholder('••••••••').click();
    const isDisabled = await page.isDisabled('[name="login"]');
    await testInfo.attach('No password entered', {
      body: await page.screenshot(),
      contentType: 'image/png',
  });

    expect(isDisabled).toBe(true);
  });

  test('Error message if ReCaptcha is skipped', async ({ page }, testInfo) => {
    await page.fill('#username', process.env.EMAIL);
    await page.fill('#password', process.env.PASSWORD);
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page.locator('#kc-content-wrapper div').filter({ hasText: 'Invalid Recaptcha' })).toBeVisible();
    await testInfo.attach('Captcha Skipped', {
      body: await page.screenshot(),
      contentType: 'image/png',
  });
  });

  test('Successful form submission', async ({ page }, testInfo) => {
    await page.fill('#username', process.env.EMAIL);
    await page.fill('#password', process.env.PASSWORD);
    await handleReCaptcha(page); // ReCaptcha handling
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL('https://search.permission.io/earn');
    await testInfo.attach('Success Log in', {
      body: await page.screenshot(),
      contentType: 'image/png',
  });
    await page.getByRole('banner').getByRole('button').click();
    await page.locator('.px-2 > div > .lucide').click();
    await expect(page).toHaveURL('https://search.permission.io/?logout=success');
    await testInfo.attach('Success Log out', {
      body: await page.screenshot(),
      contentType: 'image/png',
  });
  });
});