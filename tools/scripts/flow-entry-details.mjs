// F10 details draft against seller's local mock API: unfinished input, attributes, the open attribute scene and an
// in-place brand creation survive an immediate refresh and Back. node tools/scripts/flow-entry-details.mjs
import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const output = 'tmp/f10-details-qa';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 1024 },
      locale: 'fa-IR',
    });
    // Keep the mock worker alive across full-page navigations.
    const keepAlive = await context.newPage();
    await keepAlive.goto('http://localhost:3001/login');
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const shot = (name) => page.screenshot({ path: `${output}/${width}-${name}.png` });
    await page.goto('http://localhost:3001/login');
    await page.getByLabel(/شماره موبایل/).fill('09123456789');
    await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
    await page.waitForURL('**/login/otp**');
    await page.getByLabel(/کد ورود/).fill('123456');
    await page.getByRole('button', { name: 'تأیید و ورود' }).click();
    await page.waitForURL('**/home');
    const root = page.url().replace(/\/home$/, '');

    // a new item from the bulk receipt is a compound entry: its attributes open in their own scene
    await page.goto(`${root}/entry/search?q=${encodeURIComponent('کالای تازهٔ آزمایشی')}&bulk=1`);
    await page.getByRole('button', { name: 'ثبت کالای جدید برای فروشگاه', exact: true }).click();
    await page.waitForURL('**/details');
    const details = page.url();
    const title = page.getByLabel('نام کامل و متمایز');
    const typed = `خودکار ناتمام ${width}`;
    await title.fill(typed);
    await page.reload(); // at once: the first change of a burst is already saved
    await expect(title).toHaveValue(typed);

    await page.getByRole('button', { name: /^نوع کالا/ }).click();
    await page.getByRole('option').first().click();
    await expect(page.getByRole('button', { name: /^نوع کالا/ })).toHaveText('خودکار');
    await shot('main');
    await page.getByRole('button', { name: 'مشخصات کالا', exact: true }).first().click();
    const sceneTitle = page.getByRole('heading', { name: 'مشخصات خودکار' }).first();
    await expect(sceneTitle).toBeVisible();
    const color = page.getByRole('button', { name: /^رنگ/ });
    await color.click();
    await page.getByRole('option').first().click();
    const chosen = (await color.textContent())?.trim();
    await page.reload();
    await expect(sceneTitle).toBeVisible(); // the open attribute scene comes back
    await expect(color).toHaveText(chosen);
    await shot('attributes-restored');

    await page.getByRole('button', { name: 'انتخاب یا افزودن برند', exact: true }).click();
    const brandName = `برند ناتمام ${width}`;
    await page.getByRole('dialog').getByRole('searchbox').fill(brandName);
    await page.getByRole('dialog').getByRole('button', { name: 'افزودن برند', exact: true }).click();
    const nameField = page.getByRole('dialog').getByLabel(/نام برند/);
    await expect(nameField).toHaveValue(brandName);
    await page.reload();
    await expect(nameField).toHaveValue(brandName); // the in-place creation is reopened with its name
    await shot('creation-restored');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);

    // the browser's Back leaves without waiting; what was saved comes back on Forward
    await page.goBack();
    await page.waitForURL((url) => url.href !== details);
    await page.goForward();
    await expect(sceneTitle).toBeVisible();
    await expect(color).toHaveText(chosen);
    if (width < 1024) {
      // the mobile app bar's Back waits for the draft before it leaves (desktop has a breadcrumb instead)
      await page.getByRole('button', { name: 'بازگشت' }).first().click(); // attributes → main fields
      await expect(title).toHaveValue(typed);
      await page.getByRole('button', { name: 'بازگشت' }).first().click();
      await page.waitForURL((url) => url.href !== details);
      await page.goto(details);
      await expect(page.getByRole('button', { name: /^نوع کالا/ })).toHaveText('خودکار');
    }
    await shot('back-restored');

    // the stock and pricing steps keep their raw input across a refresh too
    if (width < 1024) await page.getByRole('button', { name: 'مشخصات کالا', exact: true }).first().click();
    await page.getByRole('button', { name: 'بررسی و ادامه', exact: true }).first().click();
    await page.waitForURL('**/units');
    await page.getByRole('button', { name: 'ادامه به موجودی', exact: true }).first().click();
    await page.waitForURL('**/stock');
    await page.getByRole('button', { name: 'موجودی از قبل در فروشگاه', exact: true }).click();
    const quantity = page.getByLabel(/^تعداد/);
    await quantity.fill('12');
    await page.reload();
    await expect(quantity).toHaveValue('۱۲');
    await shot('stock-restored');
    await page.getByRole('button', { name: 'تغییر منشأ موجودی', exact: true }).first().click();
    await page.getByRole('button', { name: 'فعلاً بدون موجودی ادامه می‌دهم', exact: true }).first().click();
    await page.waitForURL('**/pricing');
    const price = page.getByLabel(/^قیمت هر/);
    await price.fill('15000');
    await page.reload();
    await expect(price).toHaveValue('۱۵٬۰۰۰');
    await shot('pricing-restored');
    expect(errors).toEqual([]);
    console.log(`F10 details ${width}px draft kept across refresh and Back; stock and pricing input kept`);
    await context.close();
  }
} finally {
  await browser.close();
}
