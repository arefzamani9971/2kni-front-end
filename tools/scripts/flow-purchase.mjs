// Seller mock-mode flow: products → product detail → «افزودن موجودی» → purchase draft → lines → totals → finalize.
// Usage: node tools/scripts/flow-purchase.mjs <outDir> [baseUrl]
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const [, , out = 'tmp/purchase', base = 'http://localhost:3001'] = process.argv;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'fa-IR' });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && !m.text().includes('status of 4') && errors.push(m.text()));
let n = 0;
const shot = async (name, full = false) => {
  await page.waitForTimeout(500);
  const main = page.locator('main').first();
  if (full) await main.evaluate((el) => el.parentElement && (el.parentElement.style.height = 'auto'));
  await page.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-${name}.png`, fullPage: full });
  if (full) await main.evaluate((el) => el.parentElement && (el.parentElement.style.height = ''));
  console.log('shot', name, page.url());
};
const pick = async (field, option, within = page) => {
  await within.getByRole('button', { name: field }).click();
  await page.getByRole('dialog').last().getByRole('button', { name: option }).first().click();
};

await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.getByLabel(/شماره موبایل/).fill('09123456789');
await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
await page.waitForURL('**/login/otp**');
await page.getByLabel(/کد ورود/).fill('123456');
await page.getByRole('button', { name: 'تأیید و ورود' }).click();
await page.waitForURL('**/home');

await page.getByRole('link', { name: 'کالاها' }).click();
await page.waitForURL('**/products');
await page.getByText('خودکار بیک کریستال آبی').waitFor();
await shot('products', true);
await page.getByRole('button', { name: 'رو به اتمام' }).click();
await page.waitForURL('**stock=Low');
await shot('products-low');
await page.getByRole('button', { name: 'همه' }).click();
await page.getByRole('link', { name: /خودکار بیک کریستال آبی/ }).click();
await page.waitForURL('**/products/*');
await page.getByText('سوابق').waitFor();
await shot('product-detail', true);

await page.getByRole('button', { name: 'افزودن موجودی' }).click();
await page.waitForURL('**/purchases/new**');
await page.getByText('مقدار خرید').waitFor();
await pick(/واحد خرید/, /^بسته/);
await page.getByLabel(/^تعداد/).fill('2');
await page.getByLabel(/بهای هر/).fill('150000');
await pick(/تأمین‌کننده/, /پخش نوشت‌افزار البرز/);
await page.getByLabel(/شمارهٔ فاکتور/).fill('1405-231');
await shot('purchase-new', true);
await page.getByRole('button', { name: 'افزودن به رسید' }).click();
await page.waitForURL('**/lines');
await page.getByText('اقلام (1)').or(page.getByText(/اقلام \(/)).first().waitFor();
await page.getByRole('button', { name: 'افزودن کالای دیگر' }).click();
await page.getByRole('dialog').getByRole('button', { name: /پاک‌کن/ }).click();
const sheet = page.getByRole('dialog').last();
await sheet.getByText('مقدار خرید').waitFor();
await sheet.getByLabel(/^تعداد/).fill('10');
await sheet.getByLabel(/بهای هر/).fill('4000');
await sheet.getByRole('button', { name: 'ذخیرهٔ قلم' }).click();
await page.getByRole('dialog').waitFor({ state: 'detached' });
await page.waitForTimeout(600);
await shot('purchase-lines', true);
await page.getByRole('button', { name: 'بررسی جمع رسید' }).click();
await page.waitForURL('**/totals');
await page.getByLabel(/تخفیف کل/).fill('10000');
await page.getByLabel(/جمع فاکتور تأمین‌کننده/).fill('330000');
await page.getByText(/جمع محاسبه‌شده/).waitFor();
await shot('purchase-totals', true);
await page.getByRole('button', { name: 'ثبت نهایی خرید' }).click();
await page.getByText('شمارهٔ فاکتور تکراری است').waitFor();
await shot('purchase-duplicate', true);
await page.getByRole('button', { name: 'فاکتور دیگری است؛ ثبت شود' }).click();
await page.getByLabel(/دلیل/).fill('فاکتور دوم همان روز');
await page.getByRole('dialog').getByRole('button', { name: 'ثبت نهایی' }).click();
await page.waitForURL(/purchases\/[0-9a-f-]+$/);
await page.getByText('اقلام').first().waitFor();
await shot('purchase-detail', true);
await page.getByRole('button', { name: 'بازگشت' }).first().click().catch(() => undefined);
await page.goto(page.url().replace(/purchases\/.*/, 'purchases'));
await page.getByText(/رسید/).first().waitFor();
await shot('purchase-list');

console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no page errors');
await browser.close();
