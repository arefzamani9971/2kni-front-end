// F12 browser regression against the local mock seller: units and packs of a product (add with its own uses, retire
// for records), the purchase line picker, and a new item's pack with an explicit sale price on the pricing step.
// Usage: CHROME_PATH=<browser> node tools/scripts/flow-f12.mjs <outputDir> [baseUrl]
import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const [, , output = 'tmp/f12-qa', base = 'http://localhost:3001'] = process.argv;
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
    const shot = (name) =>
      page.screenshot({ path: `${output}/${viewport.width}-${name}.png`, fullPage: true });
    const scene = () => page.getByRole('dialog').or(page.locator('main')).last();

    await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
    await page.getByLabel(/شماره موبایل/).fill('09123456789');
    await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
    await page.waitForURL('**/login/otp**');
    await page.getByLabel(/کد ورود/).fill('123456');
    await page.getByRole('button', { name: 'تأیید و ورود' }).click();
    await page.waitForURL('**/home');
    const root = page.url().replace(/\/home$/, '');

    // product detail → «واحد و بسته»: the base unit, its factor and uses
    await page.goto(`${root}/products`, { waitUntil: 'networkidle' });
    await page
      .getByRole('link')
      .filter({ hasText: /خودکار/ })
      .first()
      .click();
    await page.waitForURL(/\/products\/[^/]+$/);
    const detailUrl = page.url();
    await page.getByRole('button', { name: 'واحد و بسته' }).click();
    await page.waitForURL('**/units');
    await expect(scene().getByText('واحدهای این کالا')).toBeVisible();
    await expect(scene().getByText('واحد پایه').first()).toBeVisible();
    await shot('units');

    // a purchase-only pack of 10: a count base refuses 10.5, the pack keeps its own uses
    const name = `بسته ۱۰تایی ${viewport.width}`;
    await page.getByRole('button', { name: 'افزودن واحد یا بسته' }).click();
    await page.getByLabel(/^نام واحد/).fill(name);
    await page.getByLabel(/^تعداد .* در هر واحد/).fill('10.5');
    await page.getByRole('checkbox', { name: 'قابل فروش' }).click();
    await page.getByRole('button', { name: 'ذخیره', exact: true }).click();
    await expect(page.getByLabel(/^تعداد .* در هر واحد/)).toHaveAttribute('aria-invalid', 'true');
    await shot('add-invalid');
    await page.getByLabel(/^تعداد .* در هر واحد/).fill('10');
    await page.getByRole('button', { name: 'ذخیره', exact: true }).click();
    const row = scene().getByText(new RegExp(`هر ${name} = ۱۰ .* · فقط خرید`));
    await expect(row).toBeVisible();
    await shot('added');

    // the purchase line offers it; then it is retired for records and the picker no longer does
    await page.getByRole('button', { name: 'بستن' }).click();
    await page.waitForURL(detailUrl);
    await page.getByRole('button', { name: 'افزودن موجودی' }).first().click();
    await page.waitForURL('**/purchases/continuous**');
    await page.getByLabel(/^واحد ورود/).click();
    await expect(page.getByRole('option', { name: new RegExp(name) })).toBeVisible();
    await page.keyboard.press('Escape');
    await shot('purchase-unit');
    await page.goto(detailUrl.replace(/$/, '/units'));
    await page.getByText(name, { exact: true }).waitFor();
    const unitRow = scene()
      .locator('div')
      .filter({ has: page.getByText(name, { exact: true }) })
      .filter({ has: page.getByRole('button', { name: 'بایگانی' }) })
      .last();
    await unitRow.getByRole('button', { name: 'بایگانی' }).click();
    const confirm = page.getByRole('alertdialog').or(page.getByRole('dialog')).last();
    await expect(confirm.getByText(/اسناد قبلی با همین نام و ضریب می‌مانند/)).toBeVisible();
    await shot('archive-confirm');
    await confirm.getByRole('button', { name: 'بایگانی' }).click();
    await expect(scene().getByText('برای سوابق').first()).toBeVisible();
    await shot('archived');
    await page.goto(detailUrl);
    await page.getByRole('button', { name: 'افزودن موجودی' }).first().click();
    await page.waitForURL('**/purchases/continuous**');
    await page.getByLabel(/^واحد ورود/).click();
    await expect(page.getByRole('option', { name: new RegExp(name) })).toHaveCount(0);
    await page.keyboard.press('Escape');

    // a new item: a sellable pack of 20 priced 190,000 on its own, not 20 × 10,000
    await page.goto(`${root}/entry/search?q=${encodeURIComponent('خودکار آزمایشی F12')}&bulk=1`);
    await page.getByRole('button', { name: 'ثبت کالای جدید برای فروشگاه', exact: true }).click();
    await page.waitForURL('**/details');
    await page.getByLabel('نام کامل و متمایز').fill(`خودکار آزمایشی F12 ${viewport.width}`);
    await page.getByRole('button', { name: /^نوع کالا/ }).click();
    await page.getByRole('option').first().click();
    // the pen type requires a colour (attribute scene, as in the F10 flow)
    await page.getByRole('button', { name: 'مشخصات کالا', exact: true }).first().click();
    await page.getByRole('button', { name: /^رنگ/ }).click();
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: 'بررسی و ادامه', exact: true }).first().click();
    await page.waitForURL('**/units', { timeout: 10_000 }).catch(async (e) => {
      await shot('details-blocked');
      throw e;
    });
    // the type proposes its default packs; the first one becomes the pack of 20
    await page
      .getByLabel(/^نام بسته/)
      .first()
      .fill('بسته ۲۰تایی');
    await page
      .getByLabel(/^تعداد هر بسته/)
      .first()
      .fill('20');
    await shot('entry-units');
    await page.getByRole('button', { name: 'ادامه به موجودی', exact: true }).first().click();
    await page.waitForURL('**/stock');
    // opening stock in packs: 3 packs of 20 are 60 pieces before anything is recorded
    await page.getByRole('button', { name: 'موجودی از قبل در فروشگاه', exact: true }).click();
    await page.getByLabel(/^واحد ورود/).click();
    await page.getByRole('option', { name: /بسته ۲۰تایی/ }).click();
    await page
      .getByLabel(/^تعداد/)
      .first()
      .fill('3');
    await expect(page.getByText(/۳ بسته ۲۰تایی × ۲۰ = ۶۰ عدد/)).toBeVisible();
    await page.getByLabel(/^وضعیت بها/).click();
    await page.getByRole('option', { name: 'نامعلوم' }).click();
    await shot('entry-stock');
    await page.getByRole('button', { name: 'ادامه با بهای نامعلوم', exact: true }).first().click();
    await page.waitForURL('**/pricing');
    await page.getByLabel(/^قیمت هر/).fill('10000');
    const packPrice = page.getByLabel(/^قیمت فروش هر بسته ۲۰تایی/);
    await expect(page.getByText(/خالی بماند، ۲۰۰٬۰۰۰ تومان/)).toBeVisible();
    await packPrice.fill('190000');
    // past the autosave burst window (400 ms): a hard reload inside it can lose that last keystroke burst — an open
    // limit of the shared IndexedDB autosave recorded in the F12 worklog, not hidden here
    await page.waitForTimeout(1000);
    await page.reload();
    await expect(packPrice).toHaveValue('۱۹۰٬۰۰۰'); // the raw input survives a refresh
    await shot('entry-pack-price');
    await page.getByRole('button', { name: 'ادامه', exact: true }).first().click();
    await page.waitForURL('**/review');
    await expect(page.getByText('اطلاعات کامل نیست')).toHaveCount(0);
    await shot('entry-review');

    expect(errors).toEqual([]);
    console.log(
      `F12 ${viewport.width}px: unit added with its uses, retired for records, hidden from purchase; pack price kept`,
    );
    await context.close();
  }
} finally {
  await browser.close();
}
