// F07 «انتخاب کالای کاتالوگ» against the seller mock API: node tools/scripts/flow-catalog-selection.mjs
// Opens an item from the catalog list, types the store's own name (saved as a coalesced draft and kept after a
// reload), checks that the search field is a draft (typing stays on the item, Enter returns to the results with the
// typed text, Back restores the name) and that «بررسی و ادامه» starts the entry. 390 and 1440, RTL, no overflow.
import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const output = 'tmp/catalog-selection-qa';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
try {
  for (const width of [390, 1440]) {
    const mobile = width === 390;
    const context = await browser.newContext({
      viewport: { width, height: mobile ? 844 : 1024 },
      locale: 'fa-IR',
    });
    // MSW unregisters its worker when the last client unloads; a second page keeps it across reloads.
    const keepAlive = await context.newPage();
    await keepAlive.goto('http://localhost:3001/login');
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('http://localhost:3001/login');
    await page.getByLabel(/شماره موبایل/).fill('09123456789');
    await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
    await page.waitForURL('**/login/otp**');
    await page.getByLabel(/کد ورود/).fill('123456');
    await page.getByRole('button', { name: 'تأیید و ورود' }).click();
    await page.waitForURL('**/home');
    const root = page.url().replace(/\/home$/, '');

    // an item from the catalog list response, opened the way the entry search opens a chosen result
    const listed = page.waitForResponse((response) => response.url().endsWith('/catalog/items/search'));
    await page.goto(root + '/catalog');
    const item = (await (await listed).json()).items.find((row) => !row.myStoreProductId);
    await page.goto(`${root}/entry/search?q=${encodeURIComponent(item.title)}&item=${item.id}`);
    await expect(page.getByRole('heading', { name: 'انتخاب کالای کاتالوگ' }).first()).toBeVisible();
    const name = page.getByRole('textbox', { name: /نام نمایشی/ });
    const ownName = `QA ${width} ${Date.now()}`;
    await name.fill(ownName);
    await page.waitForTimeout(700);
    await page.reload();
    await expect(name).toHaveValue(ownName);

    const itemUrl = page.url();
    const search = page.getByRole('searchbox', { name: 'جست‌وجوی نام یا بارکد' });
    await search.fill('مداد');
    await page.waitForTimeout(400);
    expect(page.url()).toBe(itemUrl);
    await expect(name).toBeVisible();
    await search.press('Enter');
    await page.waitForURL((url) => !url.search.includes('item=') && url.search.includes('q='));
    expect(decodeURIComponent(page.url())).toContain('q=مداد');
    await page.goBack();
    await expect(name).toHaveValue(ownName);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(await page.evaluate(() => document.documentElement.dir)).toBe('rtl');
    await page.screenshot({ path: `${output}/selection-${width}.png`, fullPage: true });

    expect(errors).toEqual([]);
    // the start opens the entry steps; checked once at the end, by the address only, because opening a step page
    // compiles StockForm and leaves the dev server in its error state while the F12 checkpoint lacks domain/stock-unit
    if (!mobile) {
      await page.getByRole('button', { name: 'بررسی و ادامه' }).click();
      await page.waitForURL(/\/entry\/[^/]+\/details/, { waitUntil: 'commit' });
    }
    console.log(
      `catalog selection ${width}px: draft kept after reload, search draft, Enter and Back passed` +
        (mobile ? '' : '; the start opened the entry steps'),
    );
    await context.close();
  }
} finally {
  await browser.close();
}
