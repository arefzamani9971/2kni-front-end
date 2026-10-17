// F08 + US-F08-01 against the seller mock API: node tools/scripts/flow-scan-alias.mjs
// Scan page: a hardware scanner (fast keys + Enter) reaches the lookup without a button; an invalid scan sends
// nothing. Second barcode: an invalid code makes no preview request, a scan fills the field, leaving asks once.
import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const output = 'tmp/f08-qa';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const scanner = async (page, code) => {
  for (const char of code) await page.keyboard.press(/\d/.test(char) ? `Digit${char}` : char);
  await page.keyboard.press('Enter');
};
try {
  for (const width of [390, 1440]) {
    const mobile = width === 390;
    const context = await browser.newContext({
      viewport: { width, height: mobile ? 844 : 1024 },
      locale: 'fa-IR',
    });
    // MSW unregisters its worker when the last client unloads; a second page keeps it across navigations.
    const keepAlive = await context.newPage();
    await keepAlive.goto('http://localhost:3001/login');
    const page = await context.newPage();
    const errors = [];
    const previews = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/barcode-aliases/preview'))
        previews.push(request.postDataJSON());
    });
    await page.goto('http://localhost:3001/login');
    await page.getByLabel(/شماره موبایل/).fill('09123456789');
    await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
    await page.waitForURL('**/login/otp**');
    await page.getByLabel(/کد ورود/).fill('123456');
    await page.getByRole('button', { name: 'تأیید و ورود' }).click();
    await page.waitForURL('**/home');
    const root = page.url().replace(/\/home$/, '');

    // scan page: no camera is requested on load; the scanner works while the permission prompt is open
    await page.goto(root + '/entry/scan');
    await expect(page.getByRole('heading', { name: 'اجازه استفاده از دوربین' }).first()).toBeVisible();
    if (!mobile) await expect(page.getByText('بارکدخوان آماده است')).toBeVisible();
    await page.screenshot({ path: `${output}/scan-${width}.png` });
    await scanner(page, '4006381333932');
    await page.waitForTimeout(300);
    expect(page.url()).toMatch(/\/entry\/scan$/);
    if (!mobile)
      await expect(page.getByText('بارکد نامعتبر است؛ قالب و رقم کنترل را بررسی کنید.')).toBeVisible();
    await scanner(page, '4006381333931');
    await page.waitForURL(/\/entry\/search\?q=4006381333931&origin=hardware/);

    // second barcode of a product
    await page.goto(root + '/products');
    await page
      .getByRole('link')
      .filter({ hasText: /خودکار/ })
      .first()
      .click();
    await page.waitForURL(/\/products\/[^/]+$/);
    await page.getByRole('button', { name: 'بارکد مخصوص فروشگاه' }).click();
    await page.waitForURL(/\/barcode-alias$/);
    const field = page.getByRole('textbox', { name: 'بارکد فروشگاه' });
    await expect(field).toBeVisible();
    await field.fill('4006381333932');
    await page.getByRole('button', { name: 'بازبینی بارکد' }).click();
    await expect(page.getByText('بارکد نامعتبر است؛ قالب و رقم کنترل را بررسی کنید.')).toBeVisible();
    expect(previews).toEqual([]);
    await field.fill('');
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await scanner(page, '00123457');
    await expect(field).toHaveValue('00123457');
    await page.screenshot({ path: `${output}/alias-${width}.png` });
    await page.getByRole('button', { name: 'انصراف' }).click();
    const leave = page.getByRole('button', { name: 'خروج بدون ذخیره' });
    await expect(leave).toBeVisible();
    await leave.dblclick();
    await page.waitForURL(/\/products\/[^/]+$/);
    expect(errors).toEqual([]);
    console.log(`${width}: scan → lookup, alias invalid without request, scan into field, leave once`);
    await context.close();
  }
} finally {
  await browser.close();
}
