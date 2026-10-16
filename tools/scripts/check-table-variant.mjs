import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH});
try { const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto('http://localhost:6006/iframe.html?id=patterns-datagrid--table-desktop&viewMode=story');
 const table=page.getByRole('table');await expect(table).toBeVisible();
 expect(await table.evaluate(e=>getComputedStyle(e).borderCollapse)).toBe('collapse');
 await page.getByRole('checkbox',{name:'انتخاب همهٔ موارد این صفحه'}).click();
 await expect(page.getByText('۲۰ کالا انتخاب شده')).toBeVisible();
 await page.getByRole('button',{name:'صفحهٔ بعد',exact:true}).click();
 await expect(page.getByText('۲۰ کالا انتخاب شده')).toBeVisible();
 await page.screenshot({path:'tmp/table-variant.png'}); console.log('table variant: contiguous table, page selection and pagination passed');
} finally {await browser.close();}
