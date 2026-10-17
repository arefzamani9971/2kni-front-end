// F09 barcode result against the seller mock API: node tools/scripts/flow-barcode-lookup.mjs
// Package result title (dialog on desktop over «اسکن بارکد», page title on mobile), unit and factor kept, the next
// hardware scan opens the next lookup without a button, an invalid code makes no lookup request.
import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const output = 'tmp/f09-qa';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const scanner = async (page, code) => {
  for (const char of code) await page.keyboard.press(`Digit${char}`);
  await page.keyboard.press('Enter');
};
try {
  for (const width of [390, 1440]) {
    const mobile = width === 390;
    const context = await browser.newContext({
      viewport: { width, height: mobile ? 844 : 1024 },
      locale: 'fa-IR',
    });
    const keepAlive = await context.newPage();
    await keepAlive.goto('http://localhost:3001/login');
    const page = await context.newPage();
    const errors = [];
    const lookups = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (request.method() === 'GET' && request.url().includes('/barcodes/')) lookups.push(request.url());
    });
    await page.goto('http://localhost:3001/login');
    await page.getByLabel(/شماره موبایل/).fill('09123456789');
    await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
    await page.waitForURL('**/login/otp**');
    await page.getByLabel(/کد ورود/).fill('123456');
    await page.getByRole('button', { name: 'تأیید و ورود' }).click();
    await page.waitForURL('**/home');
    const root = page.url().replace(/\/home$/, '');

    await page.goto(`${root}/entry/search?q=2001003000019&origin=hardware`);
    await expect(page.getByRole('heading', { name: 'بارکد بسته شناسایی شد' }).first()).toBeVisible();
    // the dialog hides the page from the accessibility tree; the scan page title stays visible behind it
    if (!mobile) await expect(page.locator('h1').filter({ hasText: 'اسکن بارکد' }).first()).toBeVisible();
    await expect(page.getByText(/بسته ۲۰تایی · ۲۰/)).toBeVisible();
    await page.screenshot({ path: `${output}/package-${width}.png` });

    // the next scan replaces the result
    await page
      .locator('body')
      .click({ position: { x: 3, y: 3 } })
      .catch(() => undefined);
    await scanner(page, '4006381333931');
    await page.waitForURL(/q=4006381333931&origin=hardware/);
    await expect(page.getByText('کالایی با این بارکد پیدا نشد.')).toBeVisible();

    const before = lookups.length;
    await page.goto(`${root}/entry/search?q=4006381333932&origin=manual`);
    await expect(page.getByText('قالب یا رقم کنترل بارکد معتبر نیست.')).toBeVisible();
    await page.waitForTimeout(300);
    expect(lookups.length).toBe(before);
    expect(errors).toEqual([]);
    console.log(`${width}: package title, next scan, invalid without request`);
    await context.close();
  }
} finally {
  await browser.close();
}
