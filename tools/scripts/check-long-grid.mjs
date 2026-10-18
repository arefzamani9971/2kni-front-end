import { chromium, expect } from '@playwright/test';
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH,
});
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://localhost:6006/iframe.html?id=patterns-datagrid--long-mobile-list&viewMode=story');
  const scroller = page.getByTestId('card-scroller');
  await expect(scroller).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole('article', { name: 'کالا 1', exact: true })).toBeVisible();
  const count = await page.locator('article').count();
  expect(count).toBeLessThan(40);
  await page.getByRole('article', { name: 'کالا 1', exact: true }).getByRole('button').focus();
  await scroller.evaluate((e) => {
    e.scrollTop = e.scrollHeight;
  });
  await expect(page.getByRole('article', { name: 'کالا 1000', exact: true })).toBeVisible();
  expect(await page.locator('article').count()).toBeLessThan(40);
  await expect(page.getByRole('article', { name: 'کالا 1', exact: true }).getByRole('button')).toBeFocused();
  console.log('1000 variable-height cards: bounded DOM, last item reachable, focused item retained');
  await page.screenshot({ path: 'tmp/pat-long-list.png' });
} finally {
  await browser.close();
}
