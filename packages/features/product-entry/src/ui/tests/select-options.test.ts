import { costStatusValues, priceMethodValues } from '@dukani/contracts';
import { createCatalogTranslator } from '@dukani/i18n';
import { entryCatalogs } from '../i18n/catalogs';
import { createMethods } from '../pricing/constants/PricingForm.constants';
import { createCostOptions } from '../stock/constants/StockForm.constants';
import { schema } from '../pricing/schemas/PricingForm.schema';
import { schemaFor } from '../stock/schemas/StockForm.schema';
describe('API-owned select options', () => {
  it.each(['fa', 'en'] as const)('covers the generated contract with localized labels (%s)', (locale) => {
    const t = createCatalogTranslator(locale, entryCatalogs);
    expect(createMethods(t).map((o) => o.value)).toEqual(priceMethodValues);
    expect(createCostOptions(t).map((o) => o.value)).toEqual(costStatusValues);
    expect(createMethods(t).every((o) => o.label && !o.label.includes('manualPrice'))).toBe(true);
  });
  it('uses the same contract in validation and rejects unknown values', () => {
    const t = createCatalogTranslator('en', entryCatalogs);
    const methods = schema(t).shape.method;
    const costs = schemaFor(0, t).shape.costStatus;
    for (const value of priceMethodValues) expect(methods.safeParse(value).success).toBe(true);
    for (const value of costStatusValues) expect(costs.safeParse(value).success).toBe(true);
    expect(methods.safeParse('NewUncontractedMethod').success).toBe(false);
    expect(costs.safeParse('NewUncontractedCost').success).toBe(false);
  });
});
