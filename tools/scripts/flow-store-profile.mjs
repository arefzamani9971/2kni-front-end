// F03 / US-F03-01 browser check (mock mode), mobile 390×844 and desktop 1440×1024: a new store type is saved only
// through its confirmation (Escape cancels, confirm saves once and returns to the store info), and the store QR page
// renders with its actions. RTL, no horizontal overflow, no console errors.
// Usage: CHROME_PATH=<chrome> node tools/scripts/flow-store-profile.mjs <outDir> [baseUrl]
import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const [, , out = 'tmp/flow-store-profile', base = 'http://localhost:3001'] = process.argv;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const viewports = { mobile: { width: 390, height: 844 }, desktop: { width: 1440, height: 1024 } };
const failures = [];

try {
  for (const [name, viewport] of Object.entries(viewports)) {
    const context = await browser.newContext({ viewport, locale: 'fa-IR' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(`pageerror ${e.message}`));
    page.on('console', (m) => {
      if (m.type() === 'error' && !m.text().includes('status of 4'))
        errors.push(`${new URL(page.url()).pathname}: ${m.text()}`);
    });
    const shot = (step) => page.screenshot({ path: `${out}/${name}-${step}.png`, fullPage: true });
    const noOverflow = async (step) => {
      if (await page.evaluate(() => document.scrollingElement.scrollWidth > window.innerWidth + 1))
        failures.push(`${name}/${step}: horizontal overflow`);
    };

    await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
    await page.getByLabel(/شماره موبایل/).fill('09123456789');
    await page.keyboard.press('Enter');
    await page.waitForURL('**/login/otp**');
    await page.getByLabel(/کد ورود/).fill('123456');
    await page.keyboard.press('Enter');
    await page.waitForURL('**/s/*/home');
    const storeId = new URL(page.url()).pathname.split('/')[2];

    await page.goto(`${base}/s/${storeId}/settings/store/edit`, { waitUntil: 'networkidle' });
    expect(await page.evaluate(() => document.documentElement.dir)).toBe('rtl');
    await page.getByRole('button', { name: /نوع فروشگاه/ }).click();
    await page.getByRole('radio', { name: /پوشاک/ }).click();
    await page.getByRole('button', { name: 'انتخاب پوشاک' }).click();
    await page.getByRole('button', { name: 'ذخیره تغییرات' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('حفظ می‌شوند');
    await shot('type-change-confirm');
    await noOverflow('type-change-confirm');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/settings\/store\/edit$/);

    await page.getByRole('button', { name: 'ذخیره تغییرات' }).click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'تغییر نوع و ذخیره' }).click();
    await page.waitForURL((url) => !url.pathname.endsWith('/edit'));
    await expect(page.getByText('پوشاک').first()).toBeVisible();
    await shot('after-type-change');

    await page.goto(`${base}/s/${storeId}/settings/store/qr`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('button', { name: 'دانلود QR' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'کپی لینک' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'چاپ' })).toBeVisible();
    await shot('qr');
    await noOverflow('qr');

    if (errors.length) failures.push(`${name}: ${errors.join(' | ')}`);
    await context.close();
    console.log(`${name}: done`);
  }
} catch (error) {
  failures.push(String(error));
} finally {
  await browser.close();
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log('flow-store-profile: pass');
