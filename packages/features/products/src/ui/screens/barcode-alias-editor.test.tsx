import { render } from '@dukani/i18n/testing';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as Platform from '@dukani/platform';
import { BarcodeAliasEditor } from './BarcodeAliasEditor';

const mocks = vi.hoisted(() => ({
  preview: vi.fn(),
  discard: vi.fn(),
  replace: vi.fn(),
}));
vi.mock('@dukani/platform', async (original) => ({
  ...(await original<typeof Platform>()),
  useActiveStore: () => ({ id: 'store', name: 'دکان' }),
  useNavigation: () => ({ push: vi.fn(), replace: mocks.replace, back: vi.fn() }),
}));
vi.mock('../hooks/use-product', () => ({
  useProduct: () => ({
    data: {
      id: 'product',
      title: 'خودکار بیک آبی',
      version: 3,
      status: 'Active',
      kind: 'Goods',
      catalogStatus: 'Public',
      units: [{ id: 'pack', name: 'جعبهٔ ۵۰ عددی', baseQty: '50', barcodes: ['6261234567890'] }],
    },
    error: null,
    refetch: vi.fn(),
  }),
}));
vi.mock('../hooks/use-barcode-alias', () => ({
  useBarcodeAlias: () => ({
    state: { kind: 'idle' },
    busy: false,
    unknown: false,
    allowed: true,
    loading: false,
    recoveryError: null,
    pendingIntent: undefined,
    preview: mocks.preview,
    submit: vi.fn(),
    recover: vi.fn(),
    reset: vi.fn(),
    reload: vi.fn(),
  }),
}));
vi.mock('../hooks/use-barcode-alias-form', async () => {
  const { useState } = await import('react');
  return {
    useBarcodeAliasForm: () => {
      const [value, setValue] = useState({ schemaVersion: 1, unitId: '', barcode: '' });
      return {
        value,
        update: (patch: Partial<typeof value>) => setValue((current) => ({ ...current, ...patch })),
        discard: mocks.discard,
        loading: false,
        error: null,
        saveError: undefined,
        retry: vi.fn(),
      };
    },
  };
});

const field = () => screen.getByRole('textbox', { name: 'بارکد فروشگاه' });
const scan = (code: string) => {
  for (const char of code)
    fireEvent.keyDown(document.body, { key: char, code: /\d/.test(char) ? `Digit${char}` : '' });
  fireEvent.keyDown(document.body, { key: 'Enter', code: 'Enter' });
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.preview.mockResolvedValue({
    storeProductUnitId: 'pack',
    barcode: '00123457',
    existingBarcodes: ['6261234567890'],
    alreadyExists: false,
    previewToken: 'token',
    expectedVersion: 3,
  });
});

describe('store barcode alias (US-F08-01) on the shared scan and confirm patterns', () => {
  it('an invalid code is caught before any request (F08 §7)', async () => {
    const user = userEvent.setup();
    render(<BarcodeAliasEditor productId="product" />);
    await user.type(field(), '4006381333932');
    await user.click(screen.getByRole('button', { name: 'بازبینی بارکد' }));
    expect(mocks.preview).not.toHaveBeenCalled();
    expect(await screen.findByText('بارکد نامعتبر است؛ قالب و رقم کنترل را بررسی کنید.')).toBeInTheDocument();
    expect(field()).toHaveFocus();
    await user.clear(field());
    await user.type(field(), '00123457');
    await user.click(screen.getByRole('button', { name: 'بازبینی بارکد' }));
    expect(mocks.preview).toHaveBeenCalledWith({
      storeProductUnitId: 'pack',
      barcode: '00123457',
      expectedVersion: 3,
    });
  });

  it('one preview per review; the confirmed code is read-only until «ویرایش» returns to review', async () => {
    const user = userEvent.setup();
    render(<BarcodeAliasEditor productId="product" />);
    await user.type(field(), '00123457');
    const review = screen.getByRole('button', { name: 'بازبینی بارکد' });
    fireEvent.click(review);
    fireEvent.click(review);
    expect(await screen.findByRole('button', { name: 'تأیید و ثبت بارکد' })).toBeInTheDocument();
    expect(mocks.preview).toHaveBeenCalledTimes(1);
    expect(field()).toHaveAttribute('readonly');
    await user.click(screen.getByRole('button', { name: 'ویرایش' }));
    expect(screen.getByRole('button', { name: 'بازبینی بارکد' })).toBeInTheDocument();
    expect(field()).not.toHaveAttribute('readonly');
    expect(field()).toHaveValue('00123457');
  });

  it('a duplicate found by the preview asks for a correction and returns focus to the code', async () => {
    const user = userEvent.setup();
    mocks.preview.mockRejectedValueOnce({ kind: 'Conflict', code: 'BARCODE_DUPLICATE', message: '' });
    render(<BarcodeAliasEditor productId="product" />);
    await user.type(field(), '00123457');
    await user.click(screen.getByRole('button', { name: 'بازبینی بارکد' }));
    expect(await screen.findByRole('button', { name: 'اصلاح بارکد' })).toBeInTheDocument();
    expect(field()).toHaveFocus();
  });

  it('a hardware scan fills the new code without a focused field', () => {
    render(<BarcodeAliasEditor productId="product" />);
    act(() => scan('00123457'));
    // codes are shown in Latin digits, as in the design (1255:55)
    expect(field()).toHaveValue('00123457');
  });

  it('leaving discards the draft once and keeps a failure inside the dialog', async () => {
    const user = userEvent.setup();
    let fail!: (error: Error) => void;
    mocks.discard.mockImplementationOnce(() => new Promise((_resolve, reject) => (fail = reject)));
    render(<BarcodeAliasEditor productId="product" />);
    await user.type(field(), 'DK-PEN-BOX-50');
    await user.click(screen.getByRole('button', { name: 'انصراف' }));
    const confirm = await screen.findByRole('button', { name: 'خروج بدون ذخیره' });
    await user.click(confirm);
    await user.click(confirm);
    expect(mocks.discard).toHaveBeenCalledTimes(1);
    await act(async () => fail(new Error('storage')));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
    mocks.discard.mockResolvedValueOnce(undefined);
    await user.click(screen.getByRole('button', { name: 'خروج بدون ذخیره' }));
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/s/store/products/product'));
  });
});
