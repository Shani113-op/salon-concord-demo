import { test, expect } from '@playwright/test';

test('real backend: empty schedule, booking, conflict feedback, cancellation and rebooking', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByText('No appointments yet.', { exact: false })).toBeVisible();
  await expect(page.getByText('This is a single-stylist demo.', { exact: false })).toBeVisible();

  async function fill(name) {
    await page.getByLabel('Customer name', { exact: true }).fill(name);
    await page.getByLabel('Service', { exact: true }).selectOption('Haircut');
    await page.getByLabel('Date', { exact: true }).fill('2028-02-29');
    await page.getByLabel('Time', { exact: true }).fill('10:30');
  }
  await fill('  Browser Guest  ');
  await page.getByRole('button', { name: 'Book appointment', exact: true }).click();
  await expect(page.locator('.success[role=status]')).toContainText('Appointment booked.');
  await expect(page.locator('.appointment h3')).toHaveText('Browser Guest');
  await expect(page.locator('.badge')).toHaveText('booked');

  await fill('Second Guest');
  await page.getByRole('button', { name: 'Book appointment', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('This date and time are already booked.');
  await expect(page.locator('.appointment')).toHaveCount(1);

  await page.getByRole('button', { name: 'Cancel appointment for Browser Guest', exact: false }).click();
  await expect(page.locator('.success[role=status]')).toContainText('Appointment cancelled.');
  await expect(page.locator('.badge')).toHaveText('cancelled');
  await expect(page.getByRole('button', { name: /^Cancel appointment for/ })).toHaveCount(0);

  await page.getByRole('button', { name: 'Book appointment', exact: true }).click();
  await expect(page.locator('.success[role=status]')).toContainText('Appointment booked.');
  await expect(page.locator('.appointment')).toHaveCount(2);
  await expect(page.locator('.badge.booked')).toHaveCount(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByLabel('Customer name', { exact: true })).toBeVisible();
  const layout = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, columns: getComputedStyle(document.querySelector('.dashboard')).gridTemplateColumns }));
  expect(layout.scroll).toBeLessThanOrEqual(layout.width);
  expect(layout.columns.split(' ')).toHaveLength(1);
  await page.screenshot({ path: 'test-results/mobile-dashboard.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('network failure shows a recoverable error', async ({ page }) => {
  await page.route('**/api/appointments', route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Unable to reach the salon API.');
  await expect(page.getByRole('button', { name: 'Refresh', exact: true })).toBeEnabled();
});
