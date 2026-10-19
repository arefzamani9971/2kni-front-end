import { describe, expect, it } from 'vitest';
import { decimal } from '@dukani/domain';
import { createCatalogTranslator, formatDecimalString } from '@dukani/i18n';
import { newDraft } from '../../../domain/entry-draft';
import { stockConversion } from '../presentation/stock-conversion';
import { entryCatalogs } from '../../i18n/catalogs';

const initial = newDraft('draft', { source: 'new' });
const draft = {
  ...initial,
  newItem: {
    ...initial.newItem!,
    baseUnitName: 'عدد',
    packagings: [{ name: 'بسته', baseQty: decimal.of(20) }],
  },
};
const t = createCatalogTranslator('fa', entryCatalogs);
const preview = (raw: string) =>
  stockConversion(draft, raw, 'pack:1', t, (v) => formatDecimalString(v, 'fa'));
describe('stock conversion presentation', () => {
  it('uses exact parsed amounts, including Persian input', () => {
    expect(preview('۳')).toBe('۳ بسته × ۲۰ = ۶۰ عدد');
    expect(preview('12345678901234567890')).toContain('۲۴۶٬۹۱۳٬۵۷۸٬۰۲۴٬۶۹۱٬۳۵۷٬۸۰۰');
  });
  it('does not strip mixed input, negative signs or invalid precision into a valid preview', () => {
    for (const raw of ['3x', '-3', '1.2.3', '1.5', '۰', '']) expect(preview(raw)).toBeNull();
  });
});
