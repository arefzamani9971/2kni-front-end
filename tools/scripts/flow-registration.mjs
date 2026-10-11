// F09/F10 browser QA. Lookup branches use explicit contract fixtures; registration/uploads use the mock API.
import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const output = 'tmp/registration-qa';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 1024 },
      locale: 'fa-IR',
    });
    await context.addInitScript(() => {
      const original = window.fetch;
      window.fetch = (input, init) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        if (sessionStorage.getItem('qaLookupFixture') && url.includes('/barcodes/00123457'))
          return Promise.resolve(
            new Response(sessionStorage.getItem('qaLookupFixture'), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }),
          );
        if (url.includes('/product-entry/register')) {
          const intents = JSON.parse(sessionStorage.getItem('qaIntents') ?? '[]');
          intents.push({ body: init?.body, key: new Headers(init?.headers).get('Idempotency-Key') });
          sessionStorage.setItem('qaIntents', JSON.stringify(intents));
          if (sessionStorage.getItem('qaLoseRegister') === '1') {
            return original(input, init).then((response) => {
              if (!response.ok) return response;
              throw new TypeError('QA response lost after commit');
            });
          }
        }
        return original(input, init);
      };
    });
    const keep = await context.newPage();
    await keep.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });
    const page = await context.newPage();
    let api;
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('request', (r) => {
      if (r.headers().authorization && r.url().includes('/api/v1/stores/'))
        api = { authorization: r.headers().authorization, base: r.url().split('/api/v1/')[0] };
    });
    const shot = (name) => page.screenshot({ path: `${output}/${width}-${name}.png` });
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });
    await page.getByLabel(/شماره موبایل/).fill('09123456789');
    await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
    await page.waitForURL('**/login/otp**');
    await page.getByLabel(/کد ورود/).fill('123456');
    await page.getByRole('button', { name: 'تأیید و ورود' }).click();
    await page.waitForURL('**/home');
    await expect.poll(() => Boolean(api)).toBe(true);
    const root = page.url().replace(/\/home$/, '');
    const storeId = root.split('/s/')[1];
    const fixture = await page.evaluate(
      async ({ api, storeId, width }) => {
        const call = async (path, body) => {
          const response = await fetch(api.base + '/api/v1' + path, {
            method: body ? 'POST' : 'GET',
            headers: {
              Authorization: api.authorization,
              'Content-Type': 'application/json',
              ...(body ? { 'Idempotency-Key': crypto.randomUUID() } : {}),
            },
            ...(body ? { body: JSON.stringify(body) } : {}),
          });
          if (!response.ok) throw Error(await response.text());
          return response.json();
        };
        const units = await call('/units');
        const unit = units.find((u) => u.dimension === 'Count' && u.maxDecimals === 0);
        const type = await call('/stores/' + storeId + '/catalog/product-types', {
          name: 'QA registration ' + width + ' ' + Date.now(),
          defaultBaseUnitId: unit.id,
          categoryId: null,
          defaultPackagings: [],
        });
        const items = await call('/stores/' + storeId + '/catalog/items?limit=20');
        return { typeId: type.id, publicItem: items.items.find((i) => i.status === 'Public') };
      },
      { api, storeId, width },
    );
    const start = async (kind) => {
      await page.goto(root + '/categories/types/' + fixture.typeId, { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'ثبت کالا از این نوع' }).click();
      await page.waitForURL('**/details');
      if (kind === 'Service') {
        await page.getByLabel('نوع قلم', { exact: true }).click();
        await page.getByRole('option', { name: 'خدمت', exact: true }).click();
      }
    };
    const advanceDetails = async () => {
      await page.getByRole('button', { name: 'مشخصات کالا', exact: true }).click();
      await page.getByRole('button', { name: 'بررسی و ادامه', exact: true }).click();
    };
    await start('Goods');
    const title = 'QA goods ' + width + ' ' + Date.now();
    await page.getByLabel(/نام کامل و متمایز/).fill(title);
    await shot('manual');
    await page.getByRole('button', { name: 'مشخصات کالا', exact: true }).click();
    await page.getByRole('button', { name: 'تصاویر کالا (اختیاری)', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'تصاویر کالا (اختیاری)' }).first()).toBeVisible();
    await page.locator('input[type=file]').setInputFiles({
      name: 'sample.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        await page.evaluate(() => {
          const c = document.createElement('canvas');
          c.width = 40;
          c.height = 40;
          const ctx = c.getContext('2d');
          ctx.fillStyle = '#009688';
          ctx.fillRect(0, 0, 40, 40);
          return c.toDataURL('image/png').split(',')[1];
        }),
        'base64',
      ),
    });
    await expect(page.getByRole('button', { name: 'ذخیره تصاویر', exact: true })).toBeEnabled();
    await shot('images');
    await page.getByRole('button', { name: 'ویرایش تصویر', exact: true }).click();
    await page.getByLabel('عرض (درصد)').fill('50');
    await shot('image-edit');
    await page.getByRole('button', { name: 'برش و ذخیره', exact: true }).click();
    await expect(page.getByLabel('عرض (درصد)')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'ذخیره تصاویر', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'ذخیره تصاویر', exact: true }).click();
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByRole('button', { name: 'بررسی و ادامه', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'بررسی و ادامه', exact: true }).click();
    await page.waitForURL('**/units');
    await shot('units');
    await page.getByRole('button', { name: 'ادامه به موجودی', exact: true }).click();
    await page.waitForURL('**/stock');
    await page.getByRole('button', { name: 'فعلاً بدون موجودی ادامه می‌دهم', exact: true }).click();
    await page.waitForURL('**/pricing');
    await page.getByRole('button', { name: 'فعلاً بدون قیمت فروش', exact: true }).click();
    await page.waitForURL('**/review');
    await expect(page.getByRole('button', { name: 'تأیید و ثبت', exact: true })).toBeEnabled();
    await shot('review');
    await page.evaluate(() => sessionStorage.setItem('qaLoseRegister', '1'));
    await page.getByRole('button', { name: 'تأیید و ثبت', exact: true }).click();
    await expect(page.getByRole('button', { name: 'بررسی دوباره', exact: true })).toBeVisible({
      timeout: 20000,
    });
    await page.evaluate(() => sessionStorage.removeItem('qaLoseRegister'));
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'بررسی دوباره', exact: true }).click();
    await page.waitForURL('**/done').catch(async (e) => {
      console.log(await page.locator('body').innerText());
      console.log(await page.evaluate(() => sessionStorage.getItem('qaIntents')));
      throw e;
    });
    const intents = await page.evaluate(() => JSON.parse(sessionStorage.getItem('qaIntents')));
    expect(intents.length).toBeGreaterThan(2);
    expect(intents[0].key).toBeTruthy();
    for (const intent of intents) expect(intent).toEqual(intents[0]);
    await shot('success');
    await start('Service');
    await page.getByLabel(/نام کامل و متمایز/).fill('QA service ' + width + ' ' + Date.now());
    await page.getByLabel(/بهای خدمت/).fill('۸۰');
    await page.getByLabel(/کد میان‌بر/).fill('QA' + width);
    await advanceDetails();
    await page.waitForURL('**/pricing');
    await shot('service-price');
    await page.getByRole('button', { name: 'فعلاً بدون قیمت فروش', exact: true }).click();
    await page.waitForURL('**/review');
    await page.getByRole('button', { name: 'تأیید و ثبت', exact: true }).click();
    await page.waitForURL('**/done');
    await expect(page.getByText('کالا بدون موجودی ثبت شد.', { exact: true })).toHaveCount(0);
    await page.goto(root + '/services', { waitUntil: 'networkidle' });
    await expect(page.getByText(/QA service/).first()).toBeVisible();
    await shot('services');
    await page.goto(root + '/shortcuts', { waitUntil: 'networkidle' });
    await page.getByRole('switch', { name: 'نمایش در پرتکرارها' }).last().click();
    await page.getByRole('button', { name: 'ذخیره میان‌برها', exact: true }).click();
    await expect(page.getByText('میان‌برها ذخیره شدند.', { exact: true })).toBeVisible();
    await shot('shortcuts');
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByRole('switch', { name: 'نمایش در پرتکرارها' }).last()).toBeChecked();
    // Explicitly exercise every discriminated lookup branch without relying on fixture barcode randomness.
    const match = {
      catalogItemId: fixture.publicItem.id,
      catalogItemUnitId: crypto.randomUUID(),
      title: fixture.publicItem.title,
      unitName: 'بسته',
      baseQty: '20',
      storeProductId: null,
      storeProductUnitId: null,
      available: null,
      unitPriceAmount: null,
      catalogStatus: 'Public',
      itemKind: 'Goods',
      storeProductStatus: null,
      isSellable: true,
      unitActive: true,
    };
    for (const kind of ['StoreProduct', 'GlobalCatalog', 'Multiple', 'Unknown', 'Conflict', 'Invalid']) {
      await page.goto(root + '/entry/search?q=00123457&origin=manual', { waitUntil: 'networkidle' });
      await page.evaluate(
        ({ kind, match }) => {
          sessionStorage.setItem(
            'qaLookupFixture',
            JSON.stringify({
              code: '00123457',
              kind,
              message: null,
              matches: ['Unknown', 'Invalid'].includes(kind)
                ? []
                : kind === 'Multiple'
                  ? [match, { ...match, catalogItemUnitId: crypto.randomUUID(), title: match.title + ' دوم' }]
                  : [match],
            }),
          );
        },
        { kind, match },
      );
      await page.reload({ waitUntil: 'networkidle' });
      await shot('lookup-' + kind);
      if (kind === 'Conflict') {
        await page.getByRole('button', { name: 'همان کالاست؛ گزارش اصلاح', exact: true }).click();
        await page.getByLabel('چه چیزی اشتباه است؟').fill('QA incorrect printed label');
        await page.getByLabel('مقدار صحیح پیشنهادی').fill('QA corrected title');
        await shot('correction');
        await page.getByRole('button', { name: 'ارسال درخواست', exact: true }).click();
        await expect(page.getByText('درخواست بررسی ثبت شد', { exact: true })).toBeVisible();
      }
    }
    expect(errors).toEqual([]);
    console.log(
      'PASS ' +
        width +
        ': Goods, real upload/crop, refresh, no-stock/no-price registration, Service, shortcuts and six lookup branches/correction',
    );
    await context.close();
  }
} finally {
  await browser.close();
}
