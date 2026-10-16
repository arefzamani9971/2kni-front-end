import { chromium, expect } from '@playwright/test';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
try {
  for (const mode of ['main', 'document']) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(
      `http://localhost:6006/iframe.html?id=patterns-gridscrollregression--append-in-${mode}&viewMode=story`,
    );
    await expect(page.getByRole('article').first()).toBeVisible();
    await page.evaluate((mode) => {
      const root =
        mode === 'main' ? document.querySelector('[data-testid="scroll-root"]') : document.scrollingElement;
      root.scrollTop = root.scrollHeight - root.clientHeight - 100;
    }, mode);
    await expect(page.getByRole('article', { name: 'کالا 198', exact: true })).toBeAttached();
    const before = await page.evaluate((mode) => {
      const root =
        mode === 'main' ? document.querySelector('[data-testid="scroll-root"]') : document.scrollingElement;
      return root.scrollTop;
    }, mode);
    // Dispatch without Playwright scrolling the append control into view.
    await page.getByTestId('append-page').evaluate((e) => e.click());
    await expect(page.locator('li[aria-setsize="220"]').first()).toBeAttached();
    const after = await page.evaluate((mode) => {
      const root =
        mode === 'main' ? document.querySelector('[data-testid="scroll-root"]') : document.scrollingElement;
      return root.scrollTop;
    }, mode);
    expect(Math.abs(after - before)).toBeLessThan(3);
    expect(await page.getByRole('article').count()).toBeLessThan(40);
    await page.goto(
      `http://localhost:6006/iframe.html?id=patterns-gridscrollregression--early-in-${mode}&viewMode=story`,
    );
    await expect(page.getByTestId('sentinel')).toHaveText('waiting');
    await page.evaluate((mode) => {
      const root =
        mode === 'main' ? document.querySelector('[data-testid="scroll-root"]') : document.scrollingElement;
      const sentinel = document.querySelector('[data-testid="sentinel"]');
      root.scrollTop =
        sentinel.getBoundingClientRect().top +
        root.scrollTop -
        (mode === 'main' ? root.getBoundingClientRect().top : 0) -
        root.clientHeight -
        800;
    }, mode);
    await expect(page.getByTestId('sentinel')).toHaveText('load-next');
    console.log(`${mode}: 200→220 preserves scroll and prefetch fires 800px before the end`);
    await page.close();
  }
} finally {
  await browser.close();
}
