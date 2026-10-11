import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const output = 'tmp/entry-qa';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 1024 },
      locale: 'fa-IR',
    });
    await context.addInitScript(() =>
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
        value: async () => {
          throw new DOMException('denied', 'NotAllowedError');
        },
        configurable: true,
      }),
    );
    const keepAlive = await context.newPage();
    await keepAlive.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });
    const page = await context.newPage();
    let apiContext;
    page.on('request', (request) => {
      if (request.headers().authorization && request.url().includes('/api/v1/stores/'))
        apiContext = {
          authorization: request.headers().authorization,
          base: request.url().split('/api/v1/')[0],
        };
    });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });
    await page.getByLabel(/شماره موبایل/).fill('09123456789');
    await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
    await page.waitForURL('**/login/otp**');
    await page.getByLabel(/کد ورود/).fill('123456');
    await page.getByRole('button', { name: 'تأیید و ورود' }).click();
    await page.waitForURL('**/home');
    const root = page.url().replace(/\/home$/, '');
    const shot = async (name) => page.screenshot({ path: `${output}/${width}-${name}.png` });
    await page.goto(root + '/entry/search?q=' + encodeURIComponent('خودکار'), { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'فیلتر جست‌وجو' }).waitFor();
    await shot('search');
    await page.getByRole('combobox', { name: /نام یا بارکد|نام.*بارکد/ }).click();
    await page.getByRole('listbox').waitFor();
    await shot('search-suggestions');
    await page.keyboard.press('Escape');
    await page.goto(root + '/entry/scan', { waitUntil: 'networkidle' });
    await shot('permission');
    await page.getByRole('button', { name: /اجازه.*دوربین|فعال.*دوربین|اجازه دسترسی/ }).click();
    await expect(page.getByRole('button', { name: /شروع دوباره دوربین/ })).toBeVisible();
    await shot('camera-denied');
    await page.getByRole('button', { name: 'ورود دستی بارکد', exact: true }).click();
    let lookups = 0;
    page.on('request', (r) => {
      if (/\/barcodes\//.test(r.url())) lookups++;
    });
    const input = page.getByLabel(/بارکد روی بسته/);
    await input.fill('00123456');
    await page.getByRole('button', { name: /بررسی بارکد/ }).click();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(lookups).toBe(0);
    await shot('manual-invalid');
    await input.fill('00123457');
    await page.getByRole('button', { name: /بررسی بارکد/ }).click();
    await page.waitForURL('**/entry/search?**');
    await shot('lookup');
    await page.goto(root + '/entry/bulk', { waitUntil: 'networkidle' });
    await page.evaluate(
      async ({ api, storeId }) => {
        const request = async (path) => {
          const response = await fetch(api.base + '/api/v1/stores/' + storeId + path, {
            headers: { Authorization: api.authorization },
          });
          if (!response.ok) throw Error('fixture request ' + response.status);
          return response.json();
        };
        const products = await request('/products?limit=30');
        const summary = products.items.find((p) => p.status === 'Active');
        const product = await request('/products/' + summary.id);
        const item = await request('/catalog/items/' + product.catalogItemId);
        const unit = product.units.find(
          (u) =>
            u.catalogItemUnitId &&
            item.units.some((c) => c.id === u.catalogItemUnitId && c.isPurchasable && c.baseQty === '1'),
        );
        if (!unit) throw Error('fixture unit unavailable');
        const db = await new Promise((resolve, reject) => {
          const req = indexedDB.open('dukani', 1);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
        const tx = db.transaction('drafts', 'readwrite');
        const object = tx.objectStore('drafts');
        const saved = await new Promise((resolve, reject) => {
          const req = object.getAll();
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
        const scope = saved.find((r) => r.draft.flow === 'entry-bulk').draft;
        const makeRow = (quantity, cost) => ({
          clientRowId: crypto.randomUUID(),
          entry: {
            id: crypto.randomUUID(),
            source: 'catalog',
            catalog: {
              id: item.id,
              title: item.title,
              typeName: item.productType.name,
              brandName: item.brand?.name ?? null,
              baseUnitName: item.baseUnit.name,
              baseUnitMaxDecimals: item.baseUnit.maxDecimals,
              storeProductId: product.id,
              units: [
                {
                  key: 'store:' + unit.id,
                  name: unit.name,
                  baseQty: unit.baseQty,
                  catalogItemUnitId: unit.catalogItemUnitId,
                  storeProductUnitId: unit.id,
                },
              ],
            },
            newItem: null,
            localTitle: '',
            stockDecided: true,
            pricing: null,
            lowStockThreshold: null,
            operationId: null,
            result: null,
            stock: {
              kind: 'Purchase',
              unitKey: 'store:' + unit.id,
              quantity,
              costStatus: 'Known',
              unitCost: { amount: cost, currency: 'Toman' },
              supplierId: null,
              supplierName: null,
              supplierInvoiceNo: '',
              productionDate: null,
              expiryDate: null,
            },
          },
        });
        const data = { ...scope.data, rows: [makeRow('2', '100'), makeRow('3', '200')] };
        object.put({
          key: storeId + ':' + scope.userId + ':entry-bulk:current',
          scope: storeId + ':' + scope.userId + ':entry-bulk',
          draft: { ...scope, data },
        });
        await new Promise((resolve, reject) => {
          tx.oncomplete = resolve;
          tx.onerror = () => reject(tx.error);
        });
        db.close();
      },
      { api: apiContext, storeId: root.split('/s/')[1] },
    );
    await page.reload({ waitUntil: 'networkidle' });
    await shot('bulk-table');
    await page.getByRole('button', { name: 'مرور رسید', exact: true }).click();
    await page.waitForURL('**/entry/bulk/review');
    await page.getByRole('button', { name: 'تأیید و ثبت رسید', exact: true }).waitFor({ state: 'visible' });
    await expect(page.getByRole('button', { name: 'تأیید و ثبت رسید', exact: true })).toBeEnabled();
    await shot('bulk-review');
    await page.getByRole('button', { name: 'تأیید و ثبت رسید', exact: true }).click();
    await page.waitForURL('**/entry/bulk/done');
    await shot('bulk-done');
    expect(errors).toEqual([]);
    await context.close();
  }
} finally {
  await browser.close();
}
