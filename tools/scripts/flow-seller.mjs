// Drives the seller mock-mode flow in Chromium and screenshots every step (390×844).
// Usage: node tools/scripts/flow-seller.mjs <outDir> [baseUrl]
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const [, , out = 'tmp/flow', base = 'http://localhost:3001'] = process.argv;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'fa-IR' });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && !m.text().includes('status of 4') && errors.push(m.text()));
let n = 0;
const shot = async (name) => {
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-${name}.png` });
  console.log('shot', name, page.url());
};

await page.goto(`${base}/`, { waitUntil: 'networkidle' });
await page.waitForURL('**/login**');
await shot('login');
await page.getByLabel(/شماره موبایل/).fill('09123456789');
await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
await page.waitForURL('**/login/otp**');
await shot('otp');
await page.getByLabel(/کد ورود/).fill('000000');
await page.getByRole('button', { name: 'تأیید و ورود' }).click();
await page.getByRole('alert').first().waitFor();
await shot('otp-wrong');
await page.getByLabel(/کد ورود/).fill('123456');
await page.getByRole('button', { name: /تأیید و ورود|اصلاح کد/ }).click();
await page.waitForURL('**/home');
await shot('home');
await page.mouse.wheel(0, 900);
await shot('home-scrolled');
await page.getByRole('link', { name: 'بیشتر' }).click();
await page.waitForURL('**/more');
await shot('more');
await page.getByRole('link', { name: 'فروشگاه‌های من' }).click();
await page.waitForURL('**/stores');
await shot('stores');
await page.getByRole('button', { name: 'ثبت فروشگاه' }).click();
await page.waitForURL('**/stores/new');
await shot('store-new');
await page.getByRole('button', { name: /نوع فروشگاه/ }).click();
await shot('store-type');

console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no page errors');
await browser.close();
