// Run against seller's local mock API: node tools/scripts/flow-standalone-registration.mjs [--purchase]
import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const fromPurchase = process.argv.includes('--purchase');
const output = 'tmp/f10-01-qa';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 1024 },
      locale: 'fa-IR',
    });
    // Keep the mock worker alive across full-page navigations.
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
    if (fromPurchase) {
      await page.goto(root + '/purchases/new');
      await page.getByRole('button', { name: /ثبت کالای/ }).click();
    } else await page.goto(root + '/entry/new');
    await page.waitForURL('**/details');
    await page.getByLabel('نام کامل و متمایز').fill(`کالای تست مستقل ${width} ${Date.now()}`);
    await page.getByRole('button', { name: /^نوع کالا/ }).click();
    await page.getByRole('option').first().click();
    await expect(page.getByRole('button', { name: /^نوع کالا/ })).toHaveText('خودکار');
    await page.getByRole('button', { name: /^رنگ/ }).click();
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: 'بررسی و ادامه', exact: true }).click();
    await page.waitForURL('**/review');
    const confirm = page.getByRole('button', { name: 'تأیید و ثبت', exact: true });
    await expect(confirm).toBeEnabled();
    await page.screenshot({ path: `${output}/${width}-review.png` });
    await confirm.click();
    await page.waitForURL('**/done');
    const leave = page.getByRole('button', {
      name: fromPurchase ? 'بازگشت به خرید' : 'فعلاً نه',
      exact: true,
    });
    await expect(leave).toBeVisible();
    await page.screenshot({ path: `${output}/${width}-${fromPurchase ? 'host' : 'standalone'}-done.png` });
    if (fromPurchase) {
      await leave.click();
      await page.waitForURL('**/lines?productId=*');
      await expect(page.getByRole('dialog').getByLabel(/تعداد/)).toHaveValue('');
      await page.keyboard.press('Escape');
      await page.waitForURL('**/lines');
      await page.reload();
      await expect(page.getByRole('dialog')).toHaveCount(0);
    } else {
      const doneUrl = page.url();
      await page.getByRole('button', { name: 'ثبت موجودی', exact: true }).click();
      await page.waitForURL('**/stock');
      await page.goto(doneUrl);
      await leave.click();
      await page.waitForURL('**/products');
    }
    expect(errors).toEqual([]);
    console.log(`US-F10-01 ${width}px ${fromPurchase ? 'purchase host' : 'standalone'} passed`);
    await context.close();
  }
} finally {
  await browser.close();
}
