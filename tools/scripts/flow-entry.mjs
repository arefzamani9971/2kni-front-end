// Seller mock-mode flow: login → «افزودن کالا» → new item wizard → register, with screenshots.
// Usage: node tools/scripts/flow-entry.mjs <outDir> [baseUrl]
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const [, , out = 'tmp/entry', base = 'http://localhost:3001'] = process.argv;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'fa-IR' });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && !m.text().includes('status of 4') && errors.push(m.text()));
let n = 0;
const shot = async (name, full = false) => {
  await page.waitForTimeout(500);
  const main = page.locator('main');
  if (full && (await main.count())) {
    // expand the scroll container so the whole content is captured
    await main.evaluate((el) => el.parentElement && (el.parentElement.style.height = 'auto'));
    await page.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-${name}.png`, fullPage: true });
    await main.evaluate((el) => el.parentElement && (el.parentElement.style.height = ''));
  } else await page.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-${name}.png` });
  console.log('shot', name, page.url());
};
const pick = async (field, option) => {
  await page.getByRole('button', { name: field }).click();
  await page.getByRole('dialog').getByRole('button', { name: option }).first().click();
  await page.getByRole('dialog').waitFor({ state: 'detached' });
};

await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.getByLabel(/شماره موبایل/).fill('09123456789');
await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
await page.waitForURL('**/login/otp**');
await page.getByLabel(/کد ورود/).fill('123456');
await page.getByRole('button', { name: 'تأیید و ورود' }).click();
await page.waitForURL('**/home');
await page.getByRole('link', { name: 'افزودن کالا' }).click();
await page.waitForURL('**/entry');
await shot('method');

// search: store + catalog results
await page.getByLabel('جست‌وجوی نام یا بارکد').fill('خودکار');
await page.getByRole('button', { name: 'جست‌وجو' }).click();
await page.waitForURL('**/entry/search**');
await page.getByText('در کاتالوگ عمومی').waitFor();
await shot('search', true);
await page.getByRole('button', { name: 'ثبت کالای جدید برای فروشگاه' }).click();
await page.waitForURL('**/details');

// details (new item)
await page.getByLabel(/نام کامل و متمایز/).fill('خودکار بیک آبی مدل A');
await pick(/نوع کالا/, /^خودکار/);
await pick(/^برند/, /بیک/);
await page.waitForTimeout(400);
await pick(/^رنگ/, /آبی/);
await shot('details', true);
await page.getByRole('button', { name: 'بررسی و ادامه' }).click();
await page.waitForURL('**/units');
await shot('units', true);
await page.getByRole('button', { name: 'ادامه به موجودی' }).click();
await page.waitForURL('**/stock');
await shot('stock-origin');
await page.getByRole('button', { name: 'موجودی از قبل در فروشگاه' }).click();
await page.getByLabel(/^تعداد/).fill('3');
await pick(/واحد ورود/, /بسته/);
await page.getByLabel(/بهای هر/).fill('160000');
await shot('stock-opening', true);
await page.getByRole('button', { name: 'ثبت بهای معلوم' }).click();
await page.waitForURL('**/pricing');
await page.getByLabel(/گرد کردن/).fill('500');
await shot('pricing', true);
await page.getByRole('button', { name: 'ادامه', exact: true }).click();
await page.waitForURL('**/review');
await page.getByText('موجودی و قیمت').waitFor();
await shot('review', true);
await page.getByRole('button', { name: 'تأیید و ثبت' }).click();
await page.waitForURL('**/done');
await shot('done');

console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no page errors');
await browser.close();
