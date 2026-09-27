// Combines screenshots into one labelled sheet for quick review.
// Usage: node tools/scripts/contact-sheet.mjs <out.png> <img…>
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const [, , out, ...files] = process.argv;
const cells = files
  .map((f) => `<figure><img src="data:image/png;base64,${readFileSync(f).toString('base64')}"><figcaption>${basename(f)}</figcaption></figure>`)
  .join('');
const html = `<html><body style="margin:0;display:flex;gap:8px;padding:8px;background:#ddd;font:12px sans-serif">${cells}</body>
<style>figure{margin:0}img{width:260px;display:block;border:1px solid #999}</style></html>`;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: files.length * 268 + 8, height: 600 } });
await page.setContent(html);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
