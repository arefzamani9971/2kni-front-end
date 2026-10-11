import type { Dto } from '@dukani/contracts';
import {
  localConflicts,
  localInfoValues,
  localRequestApplied,
  repeatsCatalogTitle,
  toLocalRequest,
} from './local-info';

const product = (over: Partial<Dto<'StoreProductDto'>> = {}) =>
  ({
    id: 'p1',
    title: 'خودکار مدرسه',
    catalogTitle: 'خودکار آبی',
    localTitle: 'خودکار مدرسه',
    localNote: null,
    shortcut: 'P1',
    kind: 'Goods',
    status: 'Active',
    version: 7,
    serviceCostAmount: null,
    ...over,
  }) as Dto<'StoreProductDto'>;

describe('local edit (F11)', () => {
  it('sends the edited version, keeps the shortcut and turns empty text into null', () => {
    const request = toLocalRequest(
      { localTitle: '  ', localNote: ' قفسه ۳ ', changeServiceCost: true, serviceCostAmount: '500' },
      product(),
    );
    expect(request).toEqual({
      localTitle: null,
      localNote: 'قفسه ۳',
      expectedVersion: 7,
      shortcut: 'P1',
      setServiceCost: false, // goods never send a manual cost
      serviceCostAmount: null,
    });
  });

  it('sends a service cost only when the seller changed it, null meaning unknown', () => {
    const service = product({ kind: 'Service', serviceCostAmount: '300' });
    const values = { ...localInfoValues(service), changeServiceCost: true, serviceCostAmount: null };
    expect(toLocalRequest(values, service)).toMatchObject({ setServiceCost: true, serviceCostAmount: null });
    expect(toLocalRequest(localInfoValues(service), service)).toMatchObject({ setServiceCost: false });
  });

  it('shows the effective name and sends a name that repeats the catalog name as null', () => {
    expect(localInfoValues(product({ localTitle: null })).localTitle).toBe('خودکار آبی');
    const unchanged = toLocalRequest(
      localInfoValues(product({ localTitle: null })),
      product({ localTitle: null }),
    );
    expect(unchanged.localTitle).toBeNull();
  });

  it('notices a local title that only repeats the catalog title', () => {
    expect(repeatsCatalogTitle('خودكار  آبي', 'خودکار آبی')).toBe(true);
    expect(repeatsCatalogTitle('', 'خودکار آبی')).toBe(false);
    expect(repeatsCatalogTitle('خودکار مدرسه', 'خودکار آبی')).toBe(false);
  });

  it('recognises a save that already reached the server after a lost response', () => {
    const request = toLocalRequest(
      { localTitle: 'نام تازه', localNote: '', changeServiceCost: false, serviceCostAmount: null },
      product(),
    );
    expect(localRequestApplied(product({ localTitle: 'نام تازه', version: 8 }), request)).toBe(true);
    expect(localRequestApplied(product(), request)).toBe(false);
  });

  it('compares service costs as decimals', () => {
    const service = product({ kind: 'Service' });
    const request = toLocalRequest(
      { ...localInfoValues(service), changeServiceCost: true, serviceCostAmount: '1500' },
      service,
    );
    expect(localRequestApplied(product({ kind: 'Service', serviceCostAmount: '1500.00' }), request)).toBe(
      true,
    );
    expect(localRequestApplied(product({ kind: 'Service', serviceCostAmount: null }), request)).toBe(false);
  });

  it('lists the fields a concurrent save changed differently', () => {
    const values = {
      localTitle: 'نام من',
      localNote: 'یادداشت',
      changeServiceCost: false,
      serviceCostAmount: null,
    };
    expect(localConflicts(product({ localTitle: 'نام دیگر', localNote: 'یادداشت' }), values)).toEqual([
      'localTitle',
    ]);
    expect(localConflicts(product({ localTitle: 'نام من', localNote: ' یادداشت ' }), values)).toEqual([]);
  });
});
