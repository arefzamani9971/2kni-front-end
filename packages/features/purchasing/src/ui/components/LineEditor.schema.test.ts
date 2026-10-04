import { schemaFor } from './LineEditor.schema';

const valid = {
  unitId: 'u1',
  quantity: '3',
  costStatus: 'Known' as 'Known' | 'Estimated' | 'Unknown',
  unitCost: '40000',
  productionDate: '',
  expiryDate: '',
};
const ok = (input: Partial<typeof valid>, maxDecimals = 0) => schemaFor(maxDecimals).safeParse({ ...valid, ...input }).success;

describe('purchase line schema (F13, Figma 312:9194)', () => {
  it('a line needs a unit and a positive quantity', () => {
    expect(ok({})).toBe(true);
    expect(ok({ unitId: '' })).toBe(false);
    expect(ok({ quantity: '0' })).toBe(false);
  });

  it('cost is required unless «نامعلوم»; unknown cost is not zero', () => {
    expect(ok({ unitCost: '' })).toBe(false);
    expect(ok({ unitCost: '', costStatus: 'Unknown' })).toBe(true);
  });

  it('production date may not be after the expiry date', () => {
    expect(ok({ productionDate: '2026-05-01', expiryDate: '2026-04-01' })).toBe(false);
    expect(ok({ productionDate: '2026-03-01', expiryDate: '2026-04-01' })).toBe(true);
  });
});
