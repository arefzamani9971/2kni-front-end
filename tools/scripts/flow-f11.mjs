// F11 browser regression against the local mock seller: local edit, catalog correction, archive and restore.
// Usage: CHROME_PATH=<browser> node tools/scripts/flow-f11.mjs <outputDir> [baseUrl]
import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const [, , output = 'tmp/f11-qa', base = 'http://localhost:3001'] = process.argv;
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
try {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 1024 },
  ]) {
    const context = await browser.newContext({ viewport, locale: 'fa-IR' });
    // MSW unregisters its worker when its last client unloads; a second client keeps the mock state alive.
    const keepAlive = await context.newPage();
    await keepAlive.goto(base + '/login', { waitUntil: 'networkidle' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const shot = (name) => page.screenshot({ path: `${output}/${viewport.width}-${name}.png`, fullPage: true });

    await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
    await page.getByLabel(/شماره موبایل/).fill('09123456789');
    await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
    await page.waitForURL('**/login/otp**');
    await page.getByLabel(/کد ورود/).fill('123456');
    await page.getByRole('button', { name: 'تأیید و ورود' }).click();
    await page.waitForURL('**/home');
    const root = page.url().replace(/\/home$/, '');

    // detail → local edit: the store name changes, the catalog name stays
    await page.goto(`${root}/products`, { waitUntil: 'networkidle' });
    await page.getByRole('link').filter({ hasText: /خودکار/ }).first().click();
    await page.waitForURL(/\/products\/[^/]+$/);
    const detailUrl = page.url();
    await page.getByRole('heading', { name: 'مشخصات کالا' }).waitFor();
    await shot('detail');
    await page.getByRole('button', { name: 'نام و یادداشت فروشگاه' }).click();
    await page.waitForURL('**/local');
    const localTitle = `خودکار مدرسه ${viewport.width}`;
    await page.getByLabel(/نام کالا در فروشگاه/).fill(localTitle);
    await page.getByLabel(/یادداشت خصوصی/).fill('قفسهٔ سوم');
    await shot('local');
    await page.getByRole('button', { name: 'ذخیره تغییرات' }).click();
    await page.waitForURL(detailUrl);
    await expect(page.getByText(localTitle).first()).toBeVisible();
    await expect(page.getByText('نام کاتالوگ')).toBeVisible();

    // catalog correction: only server fields, then the request's status page and withdraw
    await page.getByRole('button', { name: 'مشخصات کاتالوگ اشتباه است' }).click();
    await page.waitForURL('**/correction?**');
    await page.getByRole('heading', { name: 'توضیح مغایرت' }).waitFor();
    await page.getByRole('button', { name: 'ارسال درخواست', exact: true }).click();
    await expect(page.getByText('دست‌کم یک مورد را انتخاب کنید.')).toBeVisible();
    await page.getByRole('checkbox', { name: /عنوان کالا/ }).check();
    await page.getByLabel(/مقدار درست/).fill(`عنوان درست ${viewport.width}`);
    await page.getByLabel(/^توضیح درخواست اصلاح/).fill('روی برچسب بسته مدل دیگری نوشته شده است.');
    await shot('correction');
    await page.getByRole('button', { name: 'ارسال درخواست', exact: true }).click();
    await page.waitForURL('**/catalog/corrections/**');
    await expect(page.getByText('ارسال‌شده').first()).toBeVisible();
    await shot('correction-status');
    await page.getByRole('button', { name: 'پس گرفتن درخواست' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'پس گرفتن درخواست' }).click();
    await expect(page.getByText('پس‌گرفته‌شده').first()).toBeVisible();

    // archive → restore: same product, history stays
    // the mock backend lives in the page, so stay inside the app (a reload would reset it)
    await page.goBack();
    await page.waitForURL(detailUrl);
    // the list refetches on return (dev compiles on first use, hence the longer wait)
    await expect(page.getByText('آخرین پیشنهاد اصلاح')).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: 'بایگانی کالا' }).click();
    await page.getByRole('alertdialog').or(page.getByRole('dialog')).getByRole('button', { name: 'بایگانی کالا' }).click();
    await expect(page.getByText('این کالا بایگانی شده است')).toBeVisible();
    await expect(page.getByRole('button', { name: 'نام و یادداشت فروشگاه' })).toHaveCount(0);
    await shot('archived');
    await page.getByRole('button', { name: 'بازیابی کالا' }).click();
    await page.getByRole('alertdialog').or(page.getByRole('dialog')).getByRole('button', { name: 'بازیابی کالا' }).click();
    await expect(page.getByText('این کالا بایگانی شده است')).toHaveCount(0);

    if (errors.length) throw new Error(`page errors at ${viewport.width}: ${errors.join(' | ')}`);
    console.log(`F11 flow ok at ${viewport.width}`);
    await context.close();
  }
} finally {
  await browser.close();
}
