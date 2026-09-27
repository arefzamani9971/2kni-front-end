// Prints computed styles of elements matching a selector (debug helper).
import { chromium } from '@playwright/test';
const [, , url, selector, ...props] = process.argv;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const out = await page.$$eval(selector, (els, props) => els.slice(0, 5).map((el) => {
  const cs = getComputedStyle(el);
  return { cls: el.getAttribute('class'), dir: el.closest('[dir]')?.getAttribute('dir'), ...Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)])) };
}), props);
console.log(JSON.stringify(out, null, 1));
await browser.close();
