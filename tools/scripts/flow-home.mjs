// F04 browser check (mock mode), mobile 390×844 and desktop 1440×1024: home metrics, the week chart inside
// ChartFrame with its accessible data table, navigation (bottom bar on mobile, sidebar on desktop) and the «بیشتر»
// menu; RTL, no horizontal overflow, no console errors. Failure states are covered by home-sections.test.tsx.
// Usage: CHROME_PATH=<chrome> node tools/scripts/flow-home.mjs <outDir> [baseUrl]
import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const [, , out = 'tmp/flow-home', base = 'http://localhost:3001'] = process.argv;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const viewports = { mobile: { width: 390, height: 844 }, desktop: { width: 1440, height: 1024 } };
const failures = [];

try {
  for (const [name, viewport] of Object.entries(viewports)) {
    const context = await browser.newContext({ viewport, locale: 'fa-IR' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(`pageerror ${e.message}`));
    page.on('console', (m) => {
      if (m.type() === 'error' && !m.text().includes('status of 4'))
        errors.push(`${new URL(page.url()).pathname}: ${m.text()}`);
    });
    const noOverflow = async (step) => {
      if (await page.evaluate(() => document.scrollingElement.scrollWidth > window.innerWidth + 1))
        failures.push(`${name}/${step}: horizontal overflow`);
    };

    await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
    await page.getByLabel(/شماره موبایل/).fill('09123456789');
    await page.keyboard.press('Enter');
    await page.waitForURL('**/login/otp**');
    await page.getByLabel(/کد ورود/).fill('123456');
    await page.keyboard.press('Enter');
    await page.waitForURL('**/s/*/home');
    expect(await page.evaluate(() => document.documentElement.dir)).toBe('rtl');

    await expect(page.getByText('فروش امروز')).toBeVisible();
    const chart = page.locator('figure').filter({ hasText: 'فروش این هفته' });
    await expect(chart).toBeVisible();
    const table = chart.getByRole('table');
    await expect(table).toBeAttached();
    expect(await table.getByRole('row').count()).toBeGreaterThan(1);
    await page.screenshot({ path: `${out}/${name}-home.png`, fullPage: true });
    await noOverflow('home');

    const nav = page.getByRole('navigation').first();
    await expect(nav).toBeVisible();
    await nav
      .getByRole('link', { name: /بیشتر|تنظیمات/ })
      .first()
      .click();
    await page.waitForURL((url) => !url.pathname.endsWith('/home'));
    await page.screenshot({ path: `${out}/${name}-more.png`, fullPage: true });
    await noOverflow('more');

    if (errors.length) failures.push(`${name}: ${errors.join(' | ')}`);
    await context.close();
    console.log(`${name}: done`);
  }
} catch (error) {
  failures.push(String(error));
} finally {
  await browser.close();
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log('flow-home: pass');
