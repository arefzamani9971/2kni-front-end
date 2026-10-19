import { act, fireEvent, screen } from '@testing-library/react';
import { render } from '@dukani/i18n/testing';
import { decimal } from '@dukani/domain';
import type { Dto } from '@dukani/contracts';
import { ViewportProvider } from '@dukani/ui-kit';
import type { LineDraft } from '../../domain/purchase.types';
import { LineEditor } from './LineEditor';

type Unit = Dto<'StoreProductUnitDto'>;
const unit = (over: Partial<Unit>): Unit => ({
  id: 'u',
  catalogItemUnitId: null,
  name: 'واحد',
  baseQty: '1',
  salePriceAmount: null,
  effectivePriceAmount: null,
  isSellable: true,
  isPurchasable: true,
  barcodes: [],
  archivedAt: null,
  isBase: false,
  ...over,
});
const product = {
  id: 'p1',
  title: 'خودکار بیک',
  baseUnitName: 'عدد',
  baseUnitMaxDecimals: 0,
  units: [
    unit({ id: 'u0', name: 'عدد', isBase: true }),
    unit({ id: 'u1', name: 'بسته ۲۰تایی', baseQty: '20' }),
    unit({ id: 'u2', name: 'جفت', baseQty: '2', isPurchasable: false }),
    unit({ id: 'u3', name: 'بسته قدیمی', baseQty: '12', archivedAt: '2026-10-01T08:00:00Z' }),
  ],
} as unknown as Dto<'StoreProductDto'>;
const line = (unitId: string): LineDraft => ({
  storeProductId: 'p1',
  title: 'خودکار بیک',
  baseUnitName: 'عدد',
  unitId,
  unitName: 'بسته قدیمی',
  baseQtyPerUnit: decimal.of(12),
  quantity: decimal.of(2),
  costStatus: 'Unknown',
  unitCost: null,
  productionDate: null,
  expiryDate: null,
});
const renderEditor = (initial?: LineDraft) => {
  const onSubmit = vi.fn();
  render(
    <ViewportProvider forced="mobile">
      <LineEditor product={product} initial={initial} submitLabel="افزودن به رسید" onSubmit={onSubmit} />
    </ViewportProvider>,
  );
  return onSubmit;
};

describe('purchase line unit (F12 §6, §8, AC02, AC07)', () => {
  it('offers active purchase units only and converts packs to base units', async () => {
    const onSubmit = renderEditor();
    fireEvent.click(screen.getByLabelText(/^واحد خرید/));
    const options = screen.getAllByRole('option').map((o) => o.textContent);
    expect(options).toHaveLength(2);
    expect(options.join()).toContain('بسته ۲۰تایی');
    expect(options.join()).not.toMatch(/جفت|بسته قدیمی/); // sale-only and retired units are not bought
    fireEvent.click(screen.getAllByRole('option').find((o) => o.textContent?.includes('بسته ۲۰تایی'))!);
    fireEvent.change(screen.getByLabelText(/^تعداد بسته ۲۰تایی/), { target: { value: '3' } });
    expect(screen.getByText(/۳ × ۲۰ = ۶۰ عدد/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/^بهای هر بسته ۲۰تایی/), { target: { value: '200000' } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'افزودن به رسید' })));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ unitId: 'u1', unitName: 'بسته ۲۰تایی', baseQtyPerUnit: '20', quantity: '3' }),
    );
  });

  it('asks again for a line whose unit was retired, never moving it to another unit', async () => {
    const onSubmit = renderEditor(line('u3'));
    expect(screen.getByText('واحد خرید باید دوباره انتخاب شود')).toBeInTheDocument();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'افزودن به رسید' })));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
