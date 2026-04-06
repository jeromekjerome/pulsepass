import { test, expect } from '@playwright/test';

test('new customer onboarding logs a visit and shows a nudge', async ({ page }) => {
  let payload;
  await page.route('**/api/nudge', async route => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Try the Citrus Surge next for a lighter afternoon boost.' }),
    });
  });

  await page.goto('/');
  await page.getByPlaceholder('your@email.com').fill('new@demo.com');
  await page.getByRole('button', { name: /Check In/i }).click();
  await page.getByPlaceholder('Your name').fill('Nina');
  await page.getByRole('button', { name: 'Energy Boost' }).click();
  await page.getByRole('button', { name: /Save & Continue/i }).click();
  await page.locator('select').selectOption('Green Goddess');
  await page.getByRole('button', { name: /Log Visit & Get Suggestion/i }).click();

  await expect(page.getByText('Try the Citrus Surge next for a lighter afternoon boost.')).toBeVisible();
  expect(payload.customer.email).toBe('new@demo.com');
});

test('staff login rejects the wrong password and then opens the dashboard', async ({ page }) => {
  let payload;
  await page.route('**/api/reengage', async route => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        messages: [
          { customerName: 'Aaliyah Johnson', message: 'We miss you. Your Green Goddess is waiting.' }
        ]
      }),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /Staff Login/i }).click();
  await page.getByPlaceholder('Password').fill('wrong');
  await page.getByRole('button', { name: 'Enter' }).click();
  await expect(page.getByText('Incorrect password')).toBeVisible();

  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Enter' }).click();
  await expect(page.getByText('Staff Dashboard')).toBeVisible();

  await page.getByRole('button', { name: /Generate Messages/i }).click();
  await expect(page.getByText('We miss you. Your Green Goddess is waiting.')).toBeVisible();
  expect(payload.customers.length).toBeGreaterThan(0);
});

test('owner mode can return to customer mode', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Staff Login/i }).click();
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Enter' }).click();
  await expect(page.getByText('Staff Dashboard')).toBeVisible();
  await page.getByRole('button', { name: /Customer View/i }).click();
  await expect(page.getByText('Welcome Back')).toBeVisible();
});
