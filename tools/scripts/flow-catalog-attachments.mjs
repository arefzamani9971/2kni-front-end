// Run against seller mock API: node tools/scripts/flow-catalog-attachments.mjs
import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const output = 'tmp/f10-02-qa';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 1024 },
      locale: 'fa-IR',
    });
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
    await page.goto(root + '/entry/catalog');
    const selectGroup = page.getByRole('checkbox', {
      name: width === 390 ? 'انتخاب همهٔ موارد نمایش‌داده‌شده' : 'انتخاب همهٔ موارد این صفحه', exact: true,
    });
    await expect(selectGroup).toBeEnabled();
    const review = page.getByRole('button', { name: /بازبینی .* کالا/ });
    await review.evaluate((button) => {
      window.selectionLoading = false;
      window.selectionObserver = new MutationObserver((entries) => {
        if (entries.some((entry) => entry.oldValue === 'true') || button.getAttribute('aria-busy') === 'true')
          window.selectionLoading = true;
      });
      window.selectionObserver.observe(button, {
        attributes: true,
        attributeFilter: ['aria-busy'],
        attributeOldValue: true,
      });
    });
    const products = page.locator(width === 390 ? 'article' : 'tbody').getByRole('checkbox');
    await products.nth(0).click();
    await expect(products.nth(0)).toBeChecked();
    await expect(products.nth(1)).toBeEnabled();
    await products.nth(1).click();
    await expect(products.nth(1)).toBeChecked();
    if (width === 390) {
      const card = page.locator('article').first();
      const cardBox = await card.boundingBox();
      const unitBox = await card.getByRole('button', { name: 'واحد', exact: true }).locator('..').boundingBox();
      expect(unitBox.width).toBeGreaterThan(cardBox.width * 0.8);
    }
    await products.nth(0).click();
    await expect(products.nth(0)).not.toBeChecked();
    const selectedBeforeScopeChange = await review.textContent();
    const relevantCount = await products.count();
    if (width === 390) await page.getByRole('button', { name: /^فیلتر/ }).click();
    const scopeFilter = page.getByRole('checkbox', {
      name: 'فقط کالاهای مرتبط با صنف من و کالاهای خصوصی من',
    });
    await expect(scopeFilter).toBeChecked();
    const expanded = page.waitForResponse(
      (response) =>
        response.url().endsWith('/catalog-attachments/candidates') &&
        response.request().method() === 'POST' &&
        response.request().postDataJSON().onlyStoreType === false,
    );
    await scopeFilter.click();
    await page.getByRole('button', { name: width === 390 ? 'اعمال فیلتر' : 'جست‌وجو', exact: true }).click();
    const allPage = await (await expanded).json();
    expect(allPage.page).toBe(1);
    expect(allPage.pageSize).toBe(20);
    expect(allPage.items).toHaveLength(Math.min(20, allPage.totalCount));
    expect(allPage.totalPages).toBe(Math.ceil(allPage.totalCount / 20));
    expect(allPage.totalCount).toBeGreaterThan(relevantCount);
    await expect(review).toHaveText(selectedBeforeScopeChange);
    if (width !== 390)
      await expect(page.getByRole('button', { name: 'صفحهٔ بعد', exact: true })).toBeEnabled();
    await selectGroup.click();
    for (const checkbox of await products.all()) await expect(checkbox).toBeChecked();
    expect(
      await page.evaluate(() => {
        window.selectionObserver.disconnect();
        return window.selectionLoading;
      }),
    ).toBe(false);
    const selectedLabel = await review.textContent();
    if (width !== 390) {
      await page.getByRole('button', { name: 'صفحهٔ بعد', exact: true }).click();
      await expect(review).toHaveText(selectedLabel);
      await expect(page.getByText(/انتخاب خارج از این صفحه حفظ شده/)).toBeVisible();
      await page.getByRole('button', { name: 'صفحهٔ قبل', exact: true }).click();
    }
    await expect(page.getByLabel('بارکد فروشگاه').first()).toBeEnabled();
    await page.getByLabel('بارکد فروشگاه').first().fill('LOCAL-TEST');
    await page.getByLabel('بارکد فروشگاه').nth(1).fill('LOCAL-TEST');
    await page.getByLabel('جستجوی نام یا مشخصات کالا').fill('کالای ناموجود برای آزمون');
    if (width === 390) await page.getByLabel('جستجوی نام یا مشخصات کالا').press('Enter');
    else await page.getByRole('button', { name: 'جست‌وجو', exact: true }).click();
    await expect(page.getByText('کالایی با این فیلتر پیدا نشد')).toBeVisible();
    await expect(review).toHaveText(selectedLabel);
    await page.getByLabel('جستجوی نام یا مشخصات کالا').fill('');
    if (width === 390) await page.getByLabel('جستجوی نام یا مشخصات کالا').press('Enter');
    else await page.getByRole('button', { name: 'جست‌وجو', exact: true }).click();
    await expect(page.getByLabel('بارکد فروشگاه').first()).toHaveValue('LOCAL-TEST');
    await page.getByLabel('جستجوی نام یا مشخصات کالا').focus();
    await page.screenshot({ path: `${output}/${width}-selected.png`, fullPage: true });
    await page.getByRole('button', { name: /بازبینی .* کالا/ }).click();
    await expect(page.getByRole('button', { name: 'تأیید و افزودن کالاها', exact: true })).toBeVisible();
    await page.screenshot({ path: `${output}/${width}-review.png`, fullPage: true });
    await page.getByRole('button', { name: 'تأیید و افزودن کالاها', exact: true }).click();
    await expect(page.getByRole('button', { name: 'اصلاح فقط ردیف‌های ناموفق', exact: true })).toBeVisible({
      timeout: 30000,
    });
    await page.screenshot({ path: `${output}/${width}-result.png`, fullPage: true });
    await page.reload();
    await expect(page.getByRole('button', { name: 'اصلاح فقط ردیف‌های ناموفق', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'اصلاح فقط ردیف‌های ناموفق', exact: true }).click();
    await expect(page.getByRole('button', { name: /بازبینی .* کالا/ })).toBeVisible();
    expect(await page.locator('body').evaluate((body) => body.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    console.log(
      `US-F10-02 ${width}px selection, alias conflict, partial result, refresh and failed-only retry passed`,
    );
    await context.close();
  }
} finally {
  await browser.close();
}
