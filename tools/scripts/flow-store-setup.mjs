// F02 browser check (mock mode), mobile 390×844 and desktop 1440×1024: the setup draft keeps the typed name across a
// reload, type picker, optional hours with the overnight hint, create → result; RTL, no overflow, no console errors.
// Usage: CHROME_PATH=<chrome> node tools/scripts/flow-store-setup.mjs <outDir> [baseUrl]
import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const [, , out = 'tmp/flow-store-setup', base = 'http://localhost:3001'] = process.argv;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const viewports = { mobile: { width: 390, height: 844 }, desktop: { width: 1440, height: 1024 } };
const failures = [];

try {
  for (const [name, viewport] of Object.entries(viewports)) {
    const context = await browser.newContext({ viewport, locale: 'fa-IR' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && !m.text().includes('status of 4') && errors.push(`${new URL(page.url()).pathname}: ${m.text()}`));
    const shot = (step) => page.screenshot({ path: `${out}/${name}-${step}.png`, fullPage: true });
    const noOverflow = async (step) => {
      if (await page.evaluate(() => document.scrollingElement.scrollWidth > window.innerWidth + 1))
        failures.push(`${name}/${step}: horizontal overflow`);
    };

    // a new account (no store yet)
    await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
    await page.getByLabel(/شماره موبایل/).fill('09120000000');
    await page.keyboard.press('Enter');
    await page.waitForURL('**/login/otp**');
    await page.getByLabel(/کد ورود/).fill('123456');
    await page.keyboard.press('Enter');
    await page.waitForURL((url) => !url.pathname.startsWith('/login'));

    await page.goto(`${base}/stores/new`, { waitUntil: 'networkidle' });
    expect(await page.evaluate(() => document.documentElement.dir)).toBe('rtl');
    const storeName = page.getByLabel(/نام فروشگاه/);
    await storeName.fill('');
    await storeName.pressSequentially('فروشگاه آزمون', { delay: 30 });
    await page.waitForTimeout(900); // autosave quiet time (400 ms) + the draft write
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByLabel(/نام فروشگاه/)).toHaveValue('فروشگاه آزمون');
    await shot('setup-after-reload');
    await noOverflow('setup');

    await page.getByRole('button', { name: /نوع فروشگاه/ }).click();
    await page.getByRole('radio', { name: /پوشاک/ }).click();
    await page.getByRole('button', { name: 'انتخاب پوشاک' }).click();
    await expect(page.getByLabel(/نام فروشگاه/)).toHaveValue('فروشگاه آزمون');
    await expect(page.getByRole('button', { name: /نوع فروشگاه/ })).toContainText('پوشاک');

    await page.getByRole('button', { name: 'ثبت بقیه اطلاعات (اختیاری)' }).click();
    await page.getByRole('button', { name: 'تنظیم روزها و ساعات فعالیت' }).first().click();
    await expect(page.getByText('پایان کار در روز بعد است.')).toHaveCount(0);
    await page.getByLabel('پایان فعالیت').click();
    await page.getByRole('option', { name: '۰۲:۰۰' }).click();
    await expect(page.getByText('پایان کار در روز بعد است.')).toBeVisible();
    await shot('hours-overnight');
    await noOverflow('hours');
    await page.getByRole('button', { name: 'ذخیره ساعات فعالیت' }).click();
    await page.getByRole('button', { name: 'ذخیره و ادامه' }).click();
    await page.getByRole('button', { name: 'بعداً تکمیل می‌کنم' }).first().click();

    await expect(page.getByLabel(/نام فروشگاه/)).toHaveValue('فروشگاه آزمون');
    await page.getByRole('button', { name: 'ساخت فروشگاه' }).click();
    await expect(page.getByText('فروشگاه «فروشگاه آزمون» ساخته شد')).toBeVisible();
    await shot('result');
    await noOverflow('result');

    if (errors.length) failures.push(`${name}: console ${errors.join(' | ')}`);
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
} else console.log('flow-store-setup: pass');
