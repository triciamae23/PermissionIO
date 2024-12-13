import { test, expect } from '@playwright/test';
const { handleReCaptcha } = require('../utils/recaptchaHandler');
require('dotenv').config(); // Load environment variables

test.use({ video: 'retain-on-failure' });

test.describe('Login Feature Tests', () => {
  test.setTimeout(1200000);

  test.beforeEach(async ({ page }) => {
    await page.goto('https://search.permission.io');
    await page.getByRole('button', { name: 'Accept All' }).click();
    await page.getByRole('button', { name: 'Log in' }).click();
  });

  test('Valid Login', async ({ page }, testInfo) => {
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

  test('Invalid login', async ({ page }, testInfo) => {
    await page.fill('#username', process.env.WRONGEMAIL);
    await page.fill('#password', process.env.WRONGPASSWORD);
    await testInfo.attach('Incorrect Credentials', {
      body: await page.screenshot(),
      contentType: 'image/png',
  });
    await handleReCaptcha(page); // ReCaptcha handling
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page.locator('#input-error')).toContainText('Email or Password is incorrect.');
    await testInfo.attach('Error Message Appear', {
      body: await page.screenshot(),
      contentType: 'image/png',
  });
  });

  test('Account lockout after multiple failed attempts', async ({ page }, testInfo) => {

    // Simulate multiple failed login attempts
    for (let i = 0; i < 8; i++) {
      await page.fill('#username', process.env.EMAIL); 
      await page.fill('#password', process.env.WRONGPASSWORD); 
      await handleReCaptcha(page); // Handle ReCaptcha if needed
      await page.getByRole('button', { name: 'Log In' }).click();
    }

    // Verify account lockout message after failed attempts
    await expect(page.locator('#input-error')).toContainText('Email or Password is incorrect.');
    await testInfo.attach('Error Message Appear', {
      body: await page.screenshot(),
      contentType: 'image/png',
  });

    // Attempt to log in with the correct password after lockout
    await page.fill('#username', process.env.EMAIL); 
    await page.fill('#password', process.env.CORRECTPASSWORD); 
    await handleReCaptcha(page); // Handle ReCaptcha if needed
    await page.getByRole('button', { name: 'Log In' }).click();

    // Verify the account remains locked even with the correct password
    await expect(page.locator('#input-error')).toContainText('Account is locked. Please reset your password.');
    await testInfo.attach('Account Locked', {
      body: await page.screenshot(),
      contentType: 'image/png',
  });
  });

  test('Forgot password after account lockout', async ({ page }, testInfo) => {

    // Navigate to Forgot Password
    await page.getByRole('link', { name: 'Forgot password' }).click();

    // Submit forgot password form
    await page.fill('#username', process.env.EMAIL);
    await page.getByRole('button', { name: 'Continue' }).click();

    // Verify confirmation message
    await expect(page.getByText('Check your email')).toBeVisible();
    await expect(page.locator('#kc-content-wrapper')).toContainText('Check your email');

    // Assuming password reset is handled externally (via email link), no further automation here.

    await testInfo.attach('Reset Sucess', {
      body: await page.screenshot(),
      contentType: 'image/png',
  });
  });
});
