// Screenshots pages at the Figma mobile reference size (390×844) for visual comparison.
// Usage: node tools/scripts/screenshot.mjs <outDir> <url> [url…]
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const [, , out, ...urls] = process.argv;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, locale: 'fa-IR' });
for (const url of urls) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const name = url.replace(/^https?:\/\/[^/]+\/?/, '').replace(/[^a-z0-9]+/gi, '_').slice(0, 80) || 'index';
  await page.screenshot({ path: `${out}/${name}.png` });
  console.log('shot', name);
}
await browser.close();
