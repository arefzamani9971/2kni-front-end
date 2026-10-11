import { customerRoutes, safeNext, sellerRoutes } from './index';

describe('safeNext — post-login redirect stays inside the app (F01-S14)', () => {
  it.each(['/s/1/home', '/stores?x=1', '/login/otp'])('keeps the internal path %s', (p) => {
    expect(safeNext(p, '/fallback')).toBe(p);
  });

  it.each([
    ['protocol-relative', '//evil.com'],
    ['backslash host', String.raw`/\evil.com`],
    ['absolute URL', 'https://evil.com'],
    ['javascript URL', 'javascript:alert(1)'],
    ['relative path', 'stores'],
    ['control character', '/a\nb'],
    ['tab', '/a\tb'],
    ['DEL', '/a\u007fb'],
    ['empty', ''],
  ])('rejects %s', (_, p) => {
    expect(safeNext(p, '/fallback')).toBe('/fallback');
  });

  it('falls back on null/undefined', () => {
    expect(safeNext(null, '/f')).toBe('/f');
    expect(safeNext(undefined, '/f')).toBe('/f');
  });
});

describe('route builders', () => {
  it('encode the store id and drop empty query values', () => {
    expect(sellerRoutes.store.home('a/b')).toBe('/s/a%2Fb/home');
    expect(sellerRoutes.login()).toBe('/login');
    expect(sellerRoutes.login('/s/1/home')).toBe('/login?next=%2Fs%2F1%2Fhome');
    expect(sellerRoutes.entry.search('1', '')).toBe('/s/1/entry/search');
  });

  it('F03 pages live under the store settings', () => {
    expect(sellerRoutes.settings.store('1')).toBe('/s/1/settings/store');
    expect(sellerRoutes.settings.storeEdit('1')).toBe('/s/1/settings/store/edit');
    expect(sellerRoutes.settings.storeContact('1')).toBe('/s/1/settings/store/contact');
    expect(sellerRoutes.settings.storePrivate('1')).toBe('/s/1/settings/store/private');
  });

  it('F11 local edit and catalog corrections have their own pages', () => {
    expect(sellerRoutes.products.local('1', 'p')).toBe('/s/1/products/p/local');
    expect(sellerRoutes.catalog.correction('1', 'c/1')).toBe('/s/1/catalog/c%2F1/correction');
    expect(sellerRoutes.catalog.correction('1', 'c', 'p')).toBe('/s/1/catalog/c/correction?productId=p');
    expect(sellerRoutes.catalog.correctionDetail('1', 'r')).toBe('/s/1/catalog/corrections/r');
  });

  it('customer login carries next the same way', () => {
    expect(customerRoutes.login('/x')).toBe('/login?next=%2Fx');
  });
});
