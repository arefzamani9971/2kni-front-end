import { screen, fireEvent } from '@testing-library/react';
import { render } from '@dukani/i18n/testing';
import { ViewportProvider } from '@dukani/ui-kit';
import { describe, expect, it, vi } from 'vitest';
import { newOperationId } from '@dukani/domain';
import { AttachmentSummary } from './AttachmentSummary';
import { emptyAttachmentDraft, selectAttachmentCandidates } from '../../domain/catalog-attachment';
import type { AttachmentDraft } from '../../domain/catalog-attachment.types';

vi.mock('@dukani/platform', () => ({ useCan: () => false }));
vi.mock('./AttachmentStockAction', () => ({ AttachmentStockAction: () => null }));
vi.mock('../i18n/use-attachment-translations', () => ({
  useAttachmentTranslations: () => (key: string, values?: unknown) =>
    key + (values ? JSON.stringify(values) : ''),
}));
describe('large attachment review', () => {
  it('mounts only 20 of 1000 rows while keeping full totals and reaching every row', () => {
    const selections = selectAttachmentCandidates(
      [],
      Array.from({ length: 1000 }, (_, index) => ({
        item: {
          id: String(index),
          title: `Product ${index}`,
          productTypeId: 'type',
          productTypeName: 'Type',
        },
        units: [{ id: `unit-${index}`, name: 'piece', kind: 'Base' as const, barcodes: [] }],
      })),
    );
    const draft: AttachmentDraft = {
      ...emptyAttachmentDraft(),
      selections,
      stage: 'result',
      chunks: [
        {
          operationId: newOperationId(),
          body: { rows: selections.map((entry) => entry.row), previewToken: 'token' },
          preview: {
            previewToken: 'token',
            expiresAt: '',
            rows: selections.map((entry) => ({
              clientRowId: entry.row.clientRowId,
              title: entry.candidate.item.title,
              unitName: 'piece',
              originalBarcodes: [],
            })),
          },
          result: {
            operationId: 'operation',
            state: 'Completed',
            results: selections.map((entry, index) => ({
              clientRowId: entry.row.clientRowId,
              status: index === 999 ? 'Failed' : 'Added',
              errorCode: index === 999 ? 'BARCODE_DUPLICATE' : null,
            })),
          },
        },
      ],
    };
    const { rerender } = render(<ViewportProvider forced="desktop"><AttachmentSummary draft={draft} /></ViewportProvider>);
    expect(screen.getAllByRole('row').slice(1)).toHaveLength(20);
    expect(screen.getByText('resultCounts{"added":999,"existing":0,"failed":1}')).toBeInTheDocument();
    expect(screen.queryByText('Product 20')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'صفحهٔ ۵۰' }));
    expect(screen.getByText('Product 999')).toBeInTheDocument();
    expect(screen.getByText('Product 999')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'صفحهٔ بعد' })).toBeDisabled();
    expect(screen.getAllByRole('row').slice(1)).toHaveLength(20);
    rerender(<ViewportProvider forced="desktop"><AttachmentSummary draft={{ ...draft, chunks: [] }} /></ViewportProvider>);
    expect(screen.queryAllByRole('row')).toHaveLength(0);
  });
});
