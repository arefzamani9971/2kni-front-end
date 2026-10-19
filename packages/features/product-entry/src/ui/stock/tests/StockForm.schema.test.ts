import { createCatalogTranslator } from '@dukani/i18n';
import { entryCatalogs } from '../../i18n/catalogs';
const t = createCatalogTranslator('fa', entryCatalogs);
import { schemaFor } from '../schemas/StockForm.schema';

const valid = {
  quantity: '12',
  unitKey: 'base',
  costStatus: 'Known' as 'Known' | 'Estimated' | 'Unknown',
  unitCost: '15000',
  supplierId: '',
  invoiceNo: '',
  productionDate: '',
  expiryDate: '',
};
const messages = (input: Partial<typeof valid>, maxDecimals = 0) => {
  const r = schemaFor(maxDecimals, t).safeParse({ ...valid, ...input });
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};

describe('stock step schema (BIZ-INV / F13)', () => {
  it('accepts a known cost', () => expect(messages({})).toEqual([]));

  it('needs a cost unless it is explicitly unknown — empty is never zero', () => {
    expect(messages({ unitCost: '' })).toEqual(['unitCost: بها را وارد کنید یا «نامعلوم» را انتخاب کنید.']);
    expect(messages({ unitCost: '', costStatus: 'Estimated' })).toHaveLength(1);
    expect(messages({ unitCost: '', costStatus: 'Unknown' })).toEqual([]);
  });

  it('production may not be after expiry, nor in the future', () => {
    expect(messages({ productionDate: '2026-05-01', expiryDate: '2026-04-01' })).toContain(
      'expiryDate: تاریخ تولید نباید بعد از تاریخ انقضا باشد.',
    );
    expect(messages({ productionDate: '2999-01-01' })).toContain(
      'productionDate: تاریخ تولید نمی‌تواند در آینده باشد.',
    );
  });

  it('count units reject decimals; weighed units accept up to their precision', () => {
    expect(messages({ quantity: '1.5' }, 0)).not.toEqual([]);
    expect(messages({ quantity: '1.5' }, 3)).toEqual([]);
  });
});
