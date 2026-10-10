import { parseFilter } from './product';

describe('product filters', () => {
  it('reads filters from the URL', () => {
    expect(parseFilter({ stock: 'Low', cost: 'x' })).toEqual({ q: '', stock: 'Low', cost: 'Any' });
  });
});
