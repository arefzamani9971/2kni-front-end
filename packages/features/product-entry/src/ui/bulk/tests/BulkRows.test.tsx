import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { decimal } from '@dukani/domain';
import { I18nProvider } from '@dukani/i18n';
import { ViewportProvider } from '@dukani/ui-kit';
import type * as UiKit from '@dukani/ui-kit';
import { newDraft } from '../../../domain/entry-draft';
import type { BulkRow } from '../../../domain/bulk-draft';
import { BulkRows } from '../components/BulkRows';
import type { BulkRowsProps } from '../types/BulkRows.types';

const quantityRenders = vi.hoisted(() => vi.fn());
vi.mock('@dukani/ui-kit', async (original) => {
  const actual = await original<typeof UiKit>();
  return {
    ...actual,
    DecimalField: (props: Parameters<typeof actual.DecimalField>[0]) => {
      quantityRenders(props.value);
      return <actual.DecimalField {...props} />;
    },
  };
});

const messages = {};
const row = (id: string, quantity = '1'): BulkRow => ({
  clientRowId: id,
  entry: {
    ...newDraft(id, {
      source: 'catalog',
      catalog: {
        id,
        title: id,
        typeName: '',
        brandName: null,
        baseUnitName: 'Piece',
        baseUnitMaxDecimals: 0,
        storeProductId: id,
        units: [{ key: 'unit:pack', name: 'Pack', baseQty: decimal.of(20), catalogItemUnitId: 'pack' }],
      },
    }),
    stock: {
      kind: 'Purchase',
      unitKey: 'base',
      quantity: decimal.of(quantity),
      costStatus: 'Unknown',
      unitCost: null,
      supplierId: null,
      supplierName: null,
      supplierInvoiceNo: '',
      productionDate: null,
      expiryDate: null,
    },
  },
});

const setup = (viewport: 'desktop' | 'mobile', initial = [row('Pen'), row('Book', '29')]) => {
  let rows = initial;
  let locale: 'en' | 'fa' = 'en';
  let props: BulkRowsProps = {
    rows,
    disabled: false,
    onChange: vi.fn((id, update) => {
      rows = rows.map((current) => (current.clientRowId === id ? update(current) : current));
      props = { ...props, rows };
      repaint();
    }),
    onDelete: vi.fn(),
  };
  const content = () => (
    <I18nProvider locale={locale} messages={messages}>
      <ViewportProvider forced={viewport}>
        <BulkRows {...props} />
      </ViewportProvider>
    </I18nProvider>
  );
  const view = render(content());
  function repaint() {
    view.rerender(content());
  }
  return {
    rows: () => rows,
    props: () => props,
    update: (patch: Partial<BulkRowsProps>) => {
      props = { ...props, ...patch };
      repaint();
    },
    locale: (next: 'en' | 'fa') => {
      locale = next;
      repaint();
    },
  };
};

const openRow = (viewport: 'desktop' | 'mobile', title = 'Pen') => {
  if (viewport === 'mobile') {
    fireEvent.click(screen.getByRole('button', { name: new RegExp(title) }));
    return within(screen.getByRole('dialog', { name: title }));
  }
  return within(screen.getByRole('row', { name: new RegExp(title) }));
};

it.each(['desktop', 'mobile'] as const)(
  'keeps quantity, unit and cost editing and focused input identity on %s',
  async (viewport) => {
    const state = setup(viewport);
    const editor = openRow(viewport);
    const quantity = editor.getByRole('textbox', { name: 'Quantity' });
    quantity.focus();
    for (const value of ['', '0', '12']) {
      fireEvent.change(quantity, { target: { value } });
      expect(editor.getByRole('textbox', { name: 'Quantity' })).toBe(quantity);
      expect(quantity).toHaveValue(value);
      expect(quantity).toHaveFocus();
      expect(state.rows()[0]?.quantityInput).toBe(value);
      expect(state.rows()[0]?.entry.stock?.quantity).toBe(value || '0');
      if (value === '12') expect(quantity).not.toHaveAttribute('aria-invalid');
      else expect(quantity).toHaveAttribute('aria-invalid', 'true');
    }
    const cost = editor.getByRole('textbox', { name: /Initial cost/ });
    fireEvent.change(cost, { target: { value: '1500' } });
    expect(state.rows()[0]?.entry.stock?.unitCost?.amount).toBe('1500');
    expect(state.rows()[0]?.entry.stock?.costStatus).toBe('Known');
    fireEvent.change(cost, { target: { value: '' } });
    expect(state.rows()[0]?.entry.stock?.unitCost).toBeNull();
    expect(state.rows()[0]?.entry.stock?.costStatus).toBe('Unknown');

    fireEvent.click(editor.getByRole('button', { name: 'Stock entry unit · From catalog' }));
    fireEvent.click(await screen.findByRole('option', { name: /Pack/ }));
    expect(state.rows()[0]?.entry.stock?.unitKey).toBe('unit:pack');
    expect(state.rows()[0]?.entry.stock?.quantity).toBe('12');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    if (viewport === 'mobile') {
      fireEvent.click(editor.getByRole('button', { name: 'Back' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(screen.getByRole('button', { name: /Pen/ })).toHaveTextContent('12 Pack × 20 = 240 Piece');
    }
  },
);

it.each(['desktop', 'mobile'] as const)(
  'uses current callbacks and translates existing fields without replacing them on %s',
  (viewport) => {
    const state = setup(viewport);
    const editor = openRow(viewport);
    const originalChange = state.props().onChange;
    const originalDelete = state.props().onDelete;
    const onChange = vi.fn();
    const onDelete = vi.fn();
    state.update({ onChange, onDelete });
    const input = editor.getByRole('textbox', { name: 'Quantity' });
    input.focus();
    fireEvent.change(input, { target: { value: '8' } });
    expect(onChange).toHaveBeenCalledWith('Pen', expect.any(Function));
    expect(originalChange).not.toHaveBeenCalled();
    const update = onChange.mock.calls[0]![1] as (current: BulkRow) => BulkRow;
    // Field transforms must apply to the latest persisted row, not their rendered snapshot.
    const current = row('Pen');
    const changed = update({ ...current, entry: { ...current.entry, localTitle: 'Latest title' } });
    expect(changed.entry.localTitle).toBe('Latest title');
    expect(changed.entry.stock?.quantity).toBe('8');
    fireEvent.click(editor.getByRole('button', { name: 'Remove row' }));
    expect(onDelete).toHaveBeenCalledWith('Pen');
    expect(originalDelete).not.toHaveBeenCalled();

    input.focus();
    state.locale('fa');
    expect(editor.getByRole('textbox', { name: 'تعداد' })).toBe(input);
    expect(input).toHaveFocus();
    state.update({ disabled: true });
    expect(input).toBeDisabled();
    expect(editor.getByRole('button', { name: 'حذف ردیف' })).toBeDisabled();
    expect(editor.getByRole('button', { name: 'واحد ورود · از کاتالوگ' })).toBeDisabled();
    expect(editor.getByRole('textbox', { name: /بهای اولیه/ })).toBeDisabled();
  },
);

it('does not rerender an unchanged row quantity field while another row is edited', () => {
  const state = setup('desktop');
  const otherRow = state.rows()[1];
  const editor = openRow('desktop');
  quantityRenders.mockClear();
  fireEvent.change(editor.getByRole('textbox', { name: 'Quantity' }), { target: { value: '2' } });
  expect(quantityRenders).toHaveBeenCalledWith('2');
  expect(quantityRenders).not.toHaveBeenCalledWith('29');
  expect(state.rows()[1]).toBe(otherRow);
});

it.each(['desktop', 'mobile'] as const)(
  'keeps no-stock rows editable only for deletion on %s',
  (viewport) => {
    const initial = row('Service');
    const state = setup(viewport, [{ ...initial, entry: { ...initial.entry, stock: null } }]);
    const editor = openRow(viewport, 'Service');
    expect(editor.getByText('No stock. Add it later using “Record purchase”.')).toBeInTheDocument();
    expect(editor.queryByRole('textbox')).not.toBeInTheDocument();
    fireEvent.click(editor.getByRole('button', { name: 'Remove row' }));
    expect(state.props().onDelete).toHaveBeenCalledWith('Service');
  },
);

it('keeps every draft row visible in the unpaged desktop editor', () => {
  setup(
    'desktop',
    Array.from({ length: 25 }, (_, index) => {
      const initial = row(`Item ${index + 1}`);
      return { ...initial, entry: { ...initial.entry, stock: null } };
    }),
  );
  expect(screen.getAllByRole('row')).toHaveLength(26);
  expect(screen.getByRole('row', { name: /Item 25/ })).toBeInTheDocument();
  expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
    'Store product',
    'Quantity',
    'Stock entry unit · From catalog',
    'Initial cost:',
    'Remove row',
  ]);
});
