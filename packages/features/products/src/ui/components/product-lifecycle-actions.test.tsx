import { render } from '@dukani/i18n/testing';
import { act, fireEvent, screen, within } from '@testing-library/react';
import { appError } from '@dukani/domain';
import type { Dto } from '@dukani/contracts';
import { ProductLifecycleActions } from './ProductLifecycleActions';

const mocks = vi.hoisted(() => ({ run: vi.fn() }));
vi.mock('../hooks/use-product-lifecycle', () => ({ useProductLifecycle: () => mocks.run }));

const product = { id: 'p1', title: 'خودکار بیک', status: 'Active', version: 7 } as Dto<'StoreProductDto'>;
const confirmButton = () => within(screen.getByRole('dialog')).getByRole('button', { name: 'بایگانی کالا' });

beforeEach(() => {
  mocks.run.mockReset();
});

describe('archive confirmation (F11 §8, PAT-MODAL-01)', () => {
  it('runs once however often it is confirmed, stays open while it runs and closes on success', async () => {
    let finish!: () => void;
    mocks.run.mockReturnValue(new Promise<void>((resolve) => (finish = resolve)));
    render(<ProductLifecycleActions product={product} />);
    fireEvent.click(screen.getByRole('button', { name: 'بایگانی کالا' }));
    expect(screen.getByText('«خودکار بیک» بایگانی شود؟')).toBeInTheDocument();
    fireEvent.click(confirmButton());
    fireEvent.click(confirmButton());
    expect(mocks.run).toHaveBeenCalledTimes(1);
    expect(mocks.run).toHaveBeenCalledWith('archive');
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.getByRole('dialog')).toBeInTheDocument(); // closing would not cancel it on the server
    await act(async () => finish());
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps a failure inside the open confirmation', async () => {
    mocks.run.mockRejectedValue(appError('Conflict', 'VERSION_CONFLICT', 'Stale'));
    render(<ProductLifecycleActions product={product} />);
    fireEvent.click(screen.getByRole('button', { name: 'بایگانی کالا' }));
    await act(async () => fireEvent.click(confirmButton()));
    expect(within(screen.getByRole('dialog')).getByText('تغییر وضعیت انجام نشد')).toBeInTheDocument();
  });
});
