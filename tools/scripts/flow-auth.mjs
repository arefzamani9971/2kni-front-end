// F01 browser check (mock mode): login → OTP on mobile 390×844 and desktop 1440×1024 — RTL, keyboard submit, inline
// validation, wrong code, sign-in, rate-limit wait that keeps ticking, no horizontal overflow, no console errors.
// Usage: CHROME_PATH=<chrome> node tools/scripts/flow-auth.mjs <outDir> [baseUrl]
import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const [, , out = 'tmp/flow-auth', base = 'http://localhost:3001'] = process.argv;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const viewports = { mobile: { width: 390, height: 844 }, desktop: { width: 1440, height: 1024 } };
const failures = [];

async function open(name, viewport) {
  const context = await browser.newContext({ viewport, locale: 'fa-IR' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on(
    'console',
    (m) => m.type() === 'error' && !m.text().includes('status of 4') && errors.push(m.text()),
  );
  const shot = (step) => page.screenshot({ path: `${out}/${name}-${step}.png` });
  const noOverflow = async (step) => {
    if (await page.evaluate(() => document.scrollingElement.scrollWidth > window.innerWidth + 1))
      failures.push(`${name}/${step}: horizontal overflow`);
  };
  const close = async () => {
    if (errors.length) failures.push(`${name}: console ${errors.join(' | ')}`);
    await context.close();
  };
  await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
  return { page, shot, noOverflow, close };
}

try {
  for (const [name, viewport] of Object.entries(viewports)) {
    // 1. validation, keyboard submit, ticking resend countdown, wrong code, sign-in
    {
      const { page, shot, noOverflow, close } = await open(name, viewport);
      expect(await page.evaluate(() => document.documentElement.dir)).toBe('rtl');
      const mobile = page.getByLabel(/شماره موبایل/);
      const cta = page.getByRole('button', { name: 'دریافت کد ورود' });
      await expect(mobile).toBeFocused();
      await page.keyboard.type('0812');
      await expect(cta).toBeDisabled();
      await expect(mobile).toHaveAttribute('aria-invalid', 'true');
      await shot('login-invalid');
      await mobile.fill('۰۹۱۲۳۴۵۶۷۸۹');
      await expect(cta).toBeEnabled();
      await noOverflow('login');
      await page.keyboard.press('Enter');
      await page.waitForURL('**/login/otp**');

      const note = page.getByText(/ارسال دوباره تا/);
      await expect(note).toBeVisible();
      const before = await note.textContent();
      await page.waitForTimeout(2200);
      expect(await note.textContent()).not.toBe(before);
      await shot('otp-countdown');
      await noOverflow('otp');

      const code = page.getByLabel(/کد ورود/);
      await code.fill('000000');
      await page.keyboard.press('Enter');
      await expect(page.getByRole('alert').first()).toBeVisible();
      await expect(code).toHaveAttribute('aria-invalid', 'true');
      await shot('otp-wrong');
      await code.fill('123456');
      await page.keyboard.press('Enter');
      await page.waitForURL((url) => !url.pathname.startsWith('/login'));
      await shot('signed-in');
      await close();
    }
    // 2. a second code for the same number inside the server cooldown: OTP_RATE_LIMITED with a ticking wait
    {
      const { page, shot, noOverflow, close } = await open(name, viewport);
      await page.getByLabel(/شماره موبایل/).fill('09123456789');
      await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
      await page.waitForURL('**/login/otp**');
      await page.getByRole('button', { name: 'تغییر شماره' }).first().click();
      await page.waitForURL((url) => url.pathname === '/login');
      await expect(page.getByLabel(/شماره موبایل/)).not.toHaveValue('');
      await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
      const wait = page.getByRole('alert').filter({ hasText: 'دوباره تلاش کنید' });
      await expect(wait).toBeVisible();
      await expect(page.getByRole('button', { name: 'دریافت کد ورود' })).toBeDisabled();
      const waitBefore = await wait.textContent();
      await page.waitForTimeout(2200);
      expect(await wait.textContent()).not.toBe(waitBefore);
      await shot('login-limited');
      await noOverflow('login-limited');
      await close();
    }
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
} else console.log('flow-auth: pass');
