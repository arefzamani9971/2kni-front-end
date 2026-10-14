// Run against seller mock API: node tools/scripts/flow-catalog-attachments.mjs
import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const output = 'tmp/f10-02-qa';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
try {
  for (const width of [390, 1440]) {
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
    await expect(page.getByRole('button', { name: 'انتخاب این صفحه', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'انتخاب این صفحه', exact: true }).click();
    const review = page.getByRole('button', { name: /بازبینی .* کالا/ });
    const selectedLabel = await review.textContent();
    await page.getByRole('button', { name: 'صفحهٔ بعد', exact: true }).click();
    await expect(review).toHaveText(selectedLabel);
    await expect(page.getByText(/انتخاب خارج از این صفحه حفظ شده/)).toBeVisible();
    await page.getByRole('button', { name: 'صفحهٔ قبل', exact: true }).click();
    await expect(page.getByLabel('بارکد فروشگاه').first()).toBeEnabled();
    await page.getByLabel('بارکد فروشگاه').first().fill('LOCAL-TEST');
    await page.getByLabel('بارکد فروشگاه').nth(1).fill('LOCAL-TEST');
    await page.getByLabel('جستجوی نام یا مشخصات کالا').fill('کالای ناموجود برای آزمون');
    await page.getByRole('button', { name: 'جستجو', exact: true }).click();
    await expect(page.getByText('کالایی با این فیلتر پیدا نشد')).toBeVisible();
    await expect(review).toHaveText(selectedLabel);
    await page.getByLabel('جستجوی نام یا مشخصات کالا').fill('');
    await page.getByRole('button', { name: 'جستجو', exact: true }).click();
    await expect(page.getByLabel('بارکد فروشگاه').first()).toHaveValue('LOCAL-TEST');
    await page.getByLabel('جستجوی نام یا مشخصات کالا').focus();
    await page.screenshot({ path: `${output}/${width}-selected.png`, fullPage: true });
    await page.getByRole('button', { name: /بازبینی .* کالا/ }).click();
    await expect(page.getByRole('button', { name: 'تأیید و افزودن کالاها', exact: true })).toBeVisible();
    await page.screenshot({ path: `${output}/${width}-review.png`, fullPage: true });
    await page.getByRole('button', { name: 'تأیید و افزودن کالاها', exact: true }).click();
    await expect(page.getByRole('button', { name: 'اصلاح فقط ردیف‌های ناموفق', exact: true })).toBeVisible({
      timeout: 30000,
    });
    await page.screenshot({ path: `${output}/${width}-result.png`, fullPage: true });
    await page.reload();
    await expect(page.getByRole('button', { name: 'اصلاح فقط ردیف‌های ناموفق', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'اصلاح فقط ردیف‌های ناموفق', exact: true }).click();
    await expect(page.getByRole('button', { name: /بازبینی .* کالا/ })).toBeVisible();
    expect(await page.locator('body').evaluate((body) => body.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    console.log(
      `US-F10-02 ${width}px selection, alias conflict, partial result, refresh and failed-only retry passed`,
    );
    await context.close();
  }
} finally {
  await browser.close();
}
