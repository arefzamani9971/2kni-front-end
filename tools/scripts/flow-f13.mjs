// F13 browser regression against the seller app (mock API by default): continuous single-product purchase (CPB-06)
// and grouped opening stock (CPB-04) at 390×844 and 1440×1024.
// Checks: autocomplete policy (no request below 3 characters, one settled request), identification only (no receipt
// on scan or choice), each «ثبت خرید» its own receipt with a fresh form afterwards, zero-cost reason, draft kept
// across reload, unknown answer frozen and recovered with the same Idempotency-Key, opening pick that refuses
// products with stock history, the queue result, RTL and no horizontal overflow.
// Usage: CHROME_PATH=<browser> node tools/scripts/flow-f13.mjs <outputDir> [baseUrl] [mobile]
import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const [
  ,
  ,
  output = 'tmp/f13-qa',
  base = 'http://localhost:3001',
  mobileNumber = '09123456789',
  mode = 'mock',
] = process.argv;
// the mock API answers inside a service worker, which page.route cannot cut: the lost answer runs against the live API
const live = mode === 'live';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const report = [];
try {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 1024 },
  ]) {
    const mobile = viewport.width < 1024;
    const context = await browser.newContext({ viewport, locale: 'fa-IR' });
    // MSW unregisters its worker when its last client unloads; a second client keeps the mock state alive.
    const keepAlive = await context.newPage();
    await keepAlive.goto(base + '/login', { waitUntil: 'networkidle' });
    const page = await context.newPage();
    const errors = [];
    const searches = [];
    const receipts = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (request.method() !== 'POST') return;
      if (request.url().endsWith('/products/search')) searches.push(request.postDataJSON());
      if (request.url().endsWith('/purchases/quick'))
        receipts.push({ body: request.postDataJSON(), key: request.headers()['idempotency-key'] });
    });
    const shot = (name) =>
      page.screenshot({ path: `${output}/${viewport.width}-${name}.png`, fullPage: true });
    const noOverflow = async () =>
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
      ).toBeLessThanOrEqual(0);

    await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
    await page.getByLabel(/شماره موبایل/).fill(mobileNumber);
    const otp = page.waitForResponse((r) => r.url().includes('/auth/otp/request'));
    await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
    const code = (await (await otp).json()).devCode ?? '123456';
    await page.waitForURL('**/login/otp**');
    await page.getByLabel(/کد ورود/).fill(code);
    await page.getByRole('button', { name: 'تأیید و ورود' }).click();
    await page.waitForURL('**/home');
    const root = page.url().replace(/\/home$/, '');

    // ---------------------------------------------------------------- continuous purchase
    await page.goto(`${root}/purchases/continuous`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'خرید پیوسته' }).first()).toBeVisible();
    await expect(page.getByText('ابتدا کالا را با بارکد یا جست‌وجو انتخاب کنید.')).toBeVisible();
    await shot('continuous-empty');
    await noOverflow();

    const search = async (text) => {
      const before = searches.length;
      if (mobile) {
        await page.getByRole('combobox', { name: 'جست‌وجوی کالا' }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
      }
      const input = page.getByRole('combobox', { name: 'جست‌وجوی کالا' });
      await input.click();
      await input.pressSequentially(text.slice(0, 2), { delay: 30 });
      await page.waitForTimeout(500);
      expect(searches.length).toBe(before);
      await expect(page.getByText(/حداقل ۳ نویسه/)).toBeVisible();
      await input.pressSequentially(text.slice(2), { delay: 30 });
    };
    const answer = page.waitForResponse((r) => r.url().endsWith('/products/search'));
    await search('خودکار');
    const rows = (await (await answer).json()).items;
    await expect(page.getByRole('option').first()).toBeVisible();
    await page.waitForTimeout(400);
    expect(searches.length).toBe(1);
    expect(searches[0]).toMatchObject({ page: 1, q: 'خودکار', kind: 'Goods' });
    await shot('continuous-autocomplete');
    const chosen = rows[0];
    await page.getByRole('option').first().click();
    await expect(page.getByLabel(/^تعداد /)).toBeVisible();
    expect(receipts.length).toBe(0); // choosing identifies only

    // purchase 1: 3 units at 20,000 with shipping, its own supplier-less receipt
    await page.getByLabel(/^تعداد /).fill('3');
    await page.getByLabel(/^بهای /).fill('20000');
    await page.getByLabel(/هزینهٔ حمل/).fill('1500');
    await expect(page.getByText(/بهای هر .* پس از هزینه‌ها/)).toBeVisible();
    await shot('continuous-filled');
    const first = page.waitForResponse((r) => r.url().endsWith('/purchases/quick'));
    await page.getByRole('button', { name: 'ثبت خرید' }).click();
    expect((await first).status()).toBe(200);
    await expect(page.getByText(/^خرید «.*» ثبت شد · رسید/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'مشاهدهٔ رسید قبلی' })).toBeVisible();
    await expect(page.getByLabel(/^تعداد /)).toHaveCount(0); // the same form is ready again, nothing carried
    expect(receipts[0].body).toMatchObject({
      kind: 'Purchase',
      shippingAmount: '1500',
      line: { quantity: '3' },
    });
    await shot('continuous-recorded');

    // purchase 2 by manual barcode: a known zero needs its reason
    if (chosen.barcode) {
      await page.getByLabel('بارکد دستی').fill(chosen.barcode);
      await page.getByLabel('بارکد دستی').press('Enter');
    } else {
      await search('خودکار');
      await page.getByRole('option').first().click();
    }
    await expect(page.getByLabel(/^تعداد /)).toBeVisible();
    expect(receipts.length).toBe(1);
    await page.getByLabel(/^تعداد /).fill('2');
    await page.getByLabel(/^بهای /).fill('0');
    await expect(page.getByLabel(/دلیل بهای صفر/)).toBeVisible();
    await page.getByRole('button', { name: 'ثبت خرید' }).click();
    await expect(page.getByLabel(/دلیل بهای صفر/)).toHaveAttribute('aria-invalid', 'true');
    expect(receipts.length).toBe(1);
    await page.getByLabel(/دلیل بهای صفر/).fill('هدیهٔ پخش‌کننده');
    const second = page.waitForResponse((r) => r.url().endsWith('/purchases/quick'));
    await page.getByRole('button', { name: 'ثبت خرید' }).click();
    expect((await second).status()).toBe(200);
    expect(receipts[1].body.line).toMatchObject({ unitCostAmount: '0', zeroCostReason: 'هدیهٔ پخش‌کننده' });
    expect(receipts[1].body.shippingAmount).toBeUndefined(); // the earlier charge is not carried over
    expect(receipts[1].key).not.toBe(receipts[0].key);

    // the draft survives a reload
    await search('خودکار');
    await page.getByRole('option').first().click();
    await page.getByLabel(/^تعداد /).fill('7');
    await page.waitForTimeout(800);
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByLabel(/^تعداد /)).toHaveValue(/۷|7/);

    // an unknown answer freezes the turn; «بررسی دوباره» replays the same Idempotency-Key
    await page.getByLabel(/^بهای /).fill('21000');
    if (live) {
      await page.route('**/purchases/quick', (route) => route.abort('connectionreset'));
      await page.getByRole('button', { name: 'ثبت خرید' }).click();
      await expect(page.getByText('نتیجهٔ ثبت معلوم نیست')).toBeVisible({ timeout: 15_000 });
      await expect(page.getByLabel(/^تعداد /)).toBeDisabled();
      await shot('continuous-unknown');
      await page.unroute('**/purchases/quick');
      const frozenKey = receipts.at(-1).key;
      const recovered = page.waitForResponse((r) => r.url().endsWith('/purchases/quick'));
      await page.getByRole('button', { name: 'بررسی دوباره' }).click();
      expect((await recovered).status()).toBe(200);
      expect(receipts.at(-1).key).toBe(frozenKey);
    } else {
      const third = page.waitForResponse((r) => r.url().endsWith('/purchases/quick'));
      await page.getByRole('button', { name: 'ثبت خرید' }).click();
      expect((await third).status()).toBe(200);
    }
    await expect(page.getByText(/^خرید «.*» ثبت شد · رسید/)).toBeVisible();
    await noOverflow();
    expect(await page.evaluate(() => document.documentElement.dir)).toBe('rtl');

    // ---------------------------------------------------------------- opening pick and queue
    await page.goto(`${root}/purchases/opening`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'موجودی اولیهٔ گروهی' }).first()).toBeVisible();
    await expect(page.getByText('دارای گردش').first()).toBeVisible();
    const ready = page.getByRole('checkbox', { name: /^انتخاب / }).and(page.locator(':not([disabled])'));
    await shot('opening-pick');
    await noOverflow();
    const readyCount = await ready.count();
    if (readyCount > 0) {
      await ready.first().check();
      await page.getByRole('button', { name: /^شروع ثبت برای/ }).click();
      await page.waitForURL(/\/purchases\/opening\/[^/]+$/);
      await expect(page.getByRole('heading', { name: /^موجودی اولیه .* از / }).first()).toBeVisible();
      await expect(page.getByLabel(/تأمین‌کننده/)).toHaveCount(0);
      await page.getByLabel(/^تعداد /).fill('5');
      await page.getByLabel(/^بهای /).fill('2000');
      await shot('opening-entry');
      const opening = page.waitForResponse((r) => r.url().endsWith('/purchases/quick'));
      await page.getByRole('button', { name: 'ثبت موجودی و بعدی' }).click();
      expect((await opening).status()).toBe(200);
      expect(receipts.at(-1).body).toMatchObject({ kind: 'Opening', supplierId: null });
      expect(receipts.at(-1).body.documentDate).toBeUndefined();
      const summary = page.getByRole('heading', { name: 'خلاصهٔ موجودی اولیه' }).first();
      // more items: skip one (no request), then end the queue; recorded stays recorded
      if (!(await summary.isVisible().catch(() => false))) {
        await expect(page.getByRole('heading', { name: /^موجودی اولیه ۲ از / }).first()).toBeVisible();
        const sent = receipts.length;
        await page.getByRole('button', { name: 'رد کردن این کالا' }).click();
        await page.waitForTimeout(500);
        expect(receipts.length).toBe(sent);
        if (!(await summary.isVisible().catch(() => false))) {
          await page.getByRole('button', { name: 'پایان', exact: true }).click();
          await page.getByRole('button', { name: 'پایان صف' }).click();
        }
        await expect(summary).toBeVisible();
        await expect(page.getByText('ردشده؛ موجودی ثبت نشد')).toBeVisible();
      }
      await expect(summary).toBeVisible();
      await expect(page.getByText(/ثبت‌شده · رسید موجودی/)).toBeVisible();
      await shot('opening-result');
      await noOverflow();
    }
    report.push({
      width: viewport.width,
      receipts: receipts.length,
      searches: searches.length,
      readyCount,
      errors,
    });
    expect(errors).toEqual([]);
    await context.close();
  }
} finally {
  await browser.close();
  console.log(JSON.stringify(report, null, 2));
}
