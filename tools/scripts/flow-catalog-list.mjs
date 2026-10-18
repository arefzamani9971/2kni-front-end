// F07 catalog list (CAT-13) against the seller mock API: node tools/scripts/flow-catalog-list.mjs
// Checks requests (one per page/filter/sort, none while typing), compact search, type chips, URL restore after
// reload, desktop pager + sort, mobile infinite cards, opening a row and returning to the same filter, desktop page
// and mobile scroll (PAT-LIST-02 return context) without asking the server again.
import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const output = 'tmp/f07-qa';
mkdirSync(output, { recursive: true });
const SEARCH = '/catalog/items/search';
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
    const requests = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().endsWith(SEARCH))
        requests.push(request.postDataJSON());
    });
    const settle = () => page.waitForTimeout(600);
    const unique = () => expect(new Set(requests.map((r) => JSON.stringify(r))).size).toBe(requests.length);

    await page.goto('http://localhost:3001/login');
    await page.getByLabel(/شماره موبایل/).fill('09123456789');
    await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
    await page.waitForURL('**/login/otp**');
    await page.getByLabel(/کد ورود/).fill('123456');
    await page.getByRole('button', { name: 'تأیید و ورود' }).click();
    await page.waitForURL('**/home');
    const root = page.url().replace(/\/home$/, '');

    await page.goto(root + '/catalog');
    const rows = mobile ? page.locator('article') : page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
    await settle();
    expect(requests[0]).toMatchObject({
      page: 1,
      pageSize: 20,
      sortModel: [{ colId: 'title', sort: 'asc' }],
      onlyNotInMyStore: false,
      onlyStoreType: false,
    });
    // desktop prefetches page 2 for the pager; mobile asks only for what is near the viewport
    expect(requests.length).toBeLessThanOrEqual(mobile ? 1 : 2);
    unique();
    await page.screenshot({ path: `${output}/catalog-${width}.png`, fullPage: false });

    if (!mobile) {
      await expect(page.getByText(/۱–۲۰ از \S+ کالا/)).toBeVisible();
      const before = requests.length;
      await page.getByRole('button', { name: 'صفحهٔ ۲' }).click();
      await expect(page.getByText(/۲۱–۴۰ از \S+ کالا/)).toBeVisible();
      await settle();
      // page 2 comes from the prefetch (never asked again); only page 3 is fetched ahead
      expect(requests.slice(before).map((r) => r.page)).toEqual([3]);
      unique();
      // the page is in the address: an opened row and Back return to it, from the cache
      await expect(page).toHaveURL(/[?&]page=2/);
      const beforeOpen = requests.length;
      await rows
        .nth(3)
        .getByRole('button', { name: /^جزئیات کاتالوگ/ })
        .click();
      await page.waitForURL(/\/entry\//);
      await page.goBack();
      await expect(page.getByText(/۲۱–۴۰ از \S+ کالا/)).toBeVisible();
      await settle();
      expect(requests.length).toBe(beforeOpen);
      const titleHeader = page.getByRole('columnheader', { name: 'عنوان' });
      await expect(titleHeader).toHaveAttribute('aria-sort', 'ascending');
      await titleHeader.getByRole('button').click();
      await settle();
      await expect(titleHeader).toHaveAttribute('aria-sort', 'descending');
      // a new sort starts at page 1 (and prefetches page 2 of the same order)
      const descending = requests.filter((r) => r.sortModel?.[0]?.sort === 'desc').map((r) => r.page);
      expect(descending).toEqual([1, 2]);
      await titleHeader.getByRole('button').click();
      await settle();
    } else {
      const before = requests.length;
      await page.mouse.move(width / 2, 500); // wheel over the list, as a finger would
      for (let i = 0; i < 12 && !(await page.getByText(/همهٔ \S+ کالا نمایش داده شد/).isVisible()); i++) {
        await page.mouse.wheel(0, 2500);
        await page.waitForTimeout(400);
      }
      await expect(page.getByText(/همهٔ \S+ کالا نمایش داده شد/)).toBeVisible();
      expect(requests.length - before).toBeGreaterThanOrEqual(1);
      unique();
      // an opened card and Back bring the list back to that card, from the cache (PAT-LIST-02 return context)
      await page.evaluate(() =>
        (document.querySelector('main') ?? document.scrollingElement).scrollTo(0, 3000),
      );
      await page.waitForTimeout(500);
      const opened = await page.evaluate(() => {
        const card = [...document.querySelectorAll('article')].find((article) => {
          const box = article.getBoundingClientRect();
          return box.top > 140 && box.bottom < innerHeight - 160;
        });
        card?.querySelector('button[aria-label^="جزئیات کاتالوگ"]')?.setAttribute('data-qa-open', '');
        return card?.getAttribute('aria-label');
      });
      expect(opened).toBeTruthy();
      const beforeOpen = requests.length;
      await page.locator('[data-qa-open]').click();
      await page.waitForURL(/\/entry\//);
      await page.goBack();
      await expect(page.getByRole('article', { name: opened, exact: true })).toBeInViewport();
      await page.screenshot({ path: `${output}/catalog-return-${width}.png`, fullPage: false });
      await settle();
      expect(requests.length).toBe(beforeOpen);
      await page.evaluate(() => (document.querySelector('main') ?? document.scrollingElement).scrollTo(0, 0));
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    // typing is a draft: no request, no URL change; Enter applies once
    const field = page.getByRole('searchbox', { name: 'جست‌وجوی کالا' });
    const beforeTyping = requests.length;
    const urlBefore = page.url();
    await field.pressSequentially('خودکار', { delay: 40 });
    await settle();
    expect(requests.length).toBe(beforeTyping);
    expect(page.url()).toBe(urlBefore);
    await field.press('Enter');
    await settle();
    expect(requests.length).toBe(beforeTyping + 1);
    expect(requests.at(-1)).toMatchObject({ page: 1, q: 'خودکار' });
    await expect(page).toHaveURL(/q=/);

    // a type chip applies at once
    const chips = page.getByRole('group', { name: 'جست‌وجوی نوع کالا' }).getByRole('button');
    await expect(chips.nth(1)).toBeVisible();
    const typeName = (await chips.nth(1).textContent())?.trim();
    await chips.nth(1).click();
    await settle();
    const typeId = requests.at(-1)?.productTypeId;
    expect(typeId).toBeTruthy();
    expect(requests.at(-1)?.q).toBe('خودکار');
    await expect(page).toHaveURL(new RegExp(`productTypeId=${typeId}`));
    await expect(chips.nth(1)).toHaveAttribute('aria-pressed', 'true');

    // reload restores the applied filter from the URL
    const beforeReload = requests.length;
    await page.reload();
    await expect(field).toHaveValue('خودکار');
    await expect(page.getByRole('button', { name: typeName, exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await settle();
    expect(requests[beforeReload]).toMatchObject({ q: 'خودکار', productTypeId: typeId });

    // open a row; back returns to the same filter
    const opened = rows.first().getByRole('button', { name: 'جزئیات کاتالوگ' });
    if (await opened.count()) {
      await opened.click();
      await page.waitForURL(/\/entry\//);
      await page.goBack();
      await expect(field).toHaveValue('خودکار');
    }
    await page.screenshot({ path: `${output}/catalog-filtered-${width}.png`, fullPage: false });
    expect(errors).toEqual([]);
    console.log(`${width}: ${requests.length} list requests, all distinct`);
    await context.close();
  }
} finally {
  await browser.close();
}
