// F05/F06 browser regression and visual captures against the local mock seller.
// Usage: CHROME_PATH=<browser> node tools/scripts/flow-catalog.mjs <outputDir> [baseUrl]
import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const [, , output = 'tmp/catalog-qa', base = 'http://localhost:3001'] = process.argv;
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
try {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 1024 },
  ]) {
    const context = await browser.newContext({ viewport, locale: 'fa-IR' });
    // MSW unregisters its worker when its last client unloads. Keep a second client alive while testing refresh.
    const keepAlive = await context.newPage();
    await keepAlive.goto(base + '/login', { waitUntil: 'networkidle' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const shot = async (name) => {
      await page.screenshot({ path: `${output}/${viewport.width}-${name}.png` });
    };
    await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
    await page.getByLabel(/شماره موبایل/).fill('09123456789');
    await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
    await page.waitForURL('**/login/otp**');
    await page.getByLabel(/کد ورود/).fill('123456');
    await page.getByRole('button', { name: 'تأیید و ورود' }).click();
    await page.waitForURL('**/home');
    const root = page.url().replace(/\/home$/, '');
    await page.goto(`${root}/catalog`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'فهرست کاتالوگ' })).toBeVisible();
    await shot('catalog');
    await page.goto(`${root}/categories`, { waitUntil: 'networkidle' });
    await page.getByRole('link').filter({ hasText: 'خودکار' }).first().click();
    await page.getByRole('button', { name: 'ثبت کالا از این نوع' }).waitFor();
    await shot('type');
    await page.getByRole('button', { name: 'ثبت کالا از این نوع' }).click();
    await page.waitForURL('**/details');
    const title = `خودکار آزمایش ${viewport.width} ${Date.now()}`;
    await page.getByLabel(/نام کامل و متمایز/).fill(title);
    // since F10 the product details are on the same page (no separate «مشخصات کالا» scene)
    await expect(page.getByText('مشخصات تکمیلی کالا').first()).toBeVisible();
    await shot('details');
    await page.waitForTimeout(600);
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByLabel(/نام کامل و متمایز/)).toHaveValue(title);
    await page.getByRole('button', { name: 'انتخاب یا افزودن برند' }).click();
    await page.getByRole('dialog').waitFor();
    await shot('brand-select');
    await page.getByRole('button', { name: 'افزودن برند', exact: true }).click();
    await page.getByLabel(/نام برند/).fill(`برند آزمایش ${viewport.width}`);
    if (viewport.width === 1440) {
      await expect(page.locator('[data-state="open"].bg-scrim').first()).toHaveCSS(
        'background-color',
        'rgba(0, 0, 0, 0.24)',
      );
    }
    await shot('brand-new');
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByLabel(/نام برند/)).toHaveValue(`برند آزمایش ${viewport.width}`);
    await page.getByRole('button', { name: 'ذخیره و انتخاب برند' }).click();
    await expect(page.getByLabel(/نام برند/)).toHaveCount(0);
    await page.goto(`${root}/categories/new`, { waitUntil: 'networkidle' });

    await shot('type-new');
    const typeName = 'نوع آزمایش ' + viewport.width + ' ' + Date.now();
    const groupName = 'گروه آزمایش ' + viewport.width + ' ' + Date.now();
    await page.getByLabel(/^عنوان/).fill(typeName);
    await page.getByLabel(/واحد پایه پیش/).click();
    await page.getByRole('option', { name: 'کیلوگرم', exact: true }).click();
    await page.getByRole('button', { name: 'افزودن بسته‌بندی', exact: true }).click();
    await page.getByLabel(/نام بسته‌بندی/).fill('نیم کیلو');
    await page.getByLabel(/مقدار واحد پایه/).fill('0.5');
    await page.getByLabel(/^گروه/).click();
    await page.getByRole('button', { name: 'ثبت گروه کالا', exact: true }).click();
    await page
      .getByRole('dialog')
      .getByLabel(/^عنوان/)
      .fill(groupName);
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByRole('dialog').getByLabel(/^عنوان/)).toHaveValue(groupName);
    await page.getByRole('button', { name: 'ثبت گروه', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByLabel(/^گروه/)).toHaveText(groupName);
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByLabel(/^عنوان/)).toHaveValue(typeName);
    await expect(page.getByLabel(/نام بسته‌بندی/)).toHaveValue('نیم کیلو');
    await expect(page.getByLabel(/مقدار واحد پایه/)).toHaveValue('۰٫۵');
    if (viewport.width < 1024) await page.getByRole('button', { name: 'بازگشت', exact: true }).click();
    else await page.getByRole('button', { name: 'کالا و کاتالوگ', exact: true }).click();
    await page.getByRole('button', { name: 'ذخیره پیش‌نویس', exact: true }).click();
    await page.waitForURL((url) => !url.pathname.endsWith('/categories/new'));
    await page.goto(root + '/categories/new', { waitUntil: 'networkidle' });
    await expect(page.getByLabel(/^عنوان/)).toHaveValue(typeName);
    await page.getByRole('button', { name: 'ثبت نوع کالا', exact: true }).click();
    await page.waitForURL('**/categories/types/**');
    await expect(page.getByRole('heading', { name: 'نوع کالا: ' + typeName })).toBeVisible();
    await page.getByRole('button', { name: 'ارسال برای بررسی عمومی' }).click();
    await expect(page.getByText('در انتظار بررسی', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'ثبت کالا از این نوع' }).click();
    await page.waitForURL('**/details');
    await expect(page.getByLabel(/واحد پایهٔ فروش/)).toContainText('کیلوگرم');
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(
      `PASS ${viewport.width}: browse, type preset, details refresh, brand creation draft refresh, category/type creation, fractional package, saved-draft exit and review`,
    );
    await context.close();
  }
} finally {
  await browser.close();
}
