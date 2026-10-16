// Run against seller mock API: node tools/scripts/flow-catalog-attachments.mjs
import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const output = 'tmp/f10-02-qa';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
try {
  for (const width of [1440]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 1024 },
      locale: 'fa-IR',
    });
    const keepAlive = await context.newPage();
    await keepAlive.goto('http://localhost:3001/login');
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('http://localhost:3001/login');
    await page.getByLabel(/شماره موبایل/).fill('09123456789');
    await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
    await page.waitForURL('**/login/otp**');
    await page.getByLabel(/کد ورود/).fill('123456');
    await page.getByRole('button', { name: 'تأیید و ورود' }).click();
    await page.waitForURL('**/home');
    const root = page.url().replace(/\/home$/, '');
    await page.goto(root + '/entry/catalog');
    await expect(page.getByRole('checkbox', { name: 'انتخاب همهٔ موارد این صفحه', exact: true })).toBeEnabled();

    const first = page.getByRole('button', { name: 'دسته‌بندی', exact: true });
    const second = page.getByRole('button', { name: 'نوع کالا', exact: true });
    await first.click();
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await second.click();
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await first.click();
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(second).toHaveAttribute('aria-expanded', 'false');
    await second.click();
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await second.press('Escape');
    await expect(second).toBeFocused();
    const searchBox = await page.getByLabel('جستجوی نام یا مشخصات کالا').boundingBox();
    const categoryBox = await first.boundingBox();
    const typeBox = await second.boundingBox();
    expect(Math.abs(searchBox.y - categoryBox.y)).toBeLessThan(3);
    expect(Math.abs(categoryBox.y - typeBox.y)).toBeLessThan(3);
    expect(searchBox.width).toBeLessThan(800);
    console.log('dropdown switching both ways, Escape focus and aligned desktop fields passed');
    await page.screenshot({ path: output + '/filter-layout.png' });
    await context.close();
  }
} finally {
  await browser.close();
}
