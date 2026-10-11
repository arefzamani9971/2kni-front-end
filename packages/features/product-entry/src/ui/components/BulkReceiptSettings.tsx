'use client';
import { todayDateOnly, type DateOnly } from '@dukani/domain';
import { Alert, Button, DateField, SelectField, TextField, useAppErrorMessage } from '@dukani/ui-kit';
import type { BulkReceipt, BulkDraft } from '../../domain/bulk-draft.types';
import { useSuppliers } from '../hooks/use-suppliers';
import { useEntryTranslations } from '../i18n/use-entry-translations';
type Props = {
  receipt: BulkReceipt;
  mode: NonNullable<BulkDraft['scanMode']>;
  disabled: boolean;
  onReceiptChange: (patch: Partial<BulkReceipt>) => void;
  onModeChange: (mode: NonNullable<BulkDraft['scanMode']>) => void;
};
export function BulkReceiptSettings({ receipt, mode, disabled, onReceiptChange, onModeChange }: Props) {
  const t = useEntryTranslations();
  const suppliers = useSuppliers();
  const message = useAppErrorMessage();
  return (
    <>
      <SelectField
        label={t('scanSettings')}
        disabled={disabled}
        value={mode}
        options={[
          { value: 'PlusOne', label: t('bulk.plusOne') },
          { value: 'ScanThenQuantity', label: t('bulk.askQuantity') },
        ]}
        onChange={(value) => {
          if (value === 'PlusOne' || value === 'ScanThenQuantity') onModeChange(value);
        }}
      />
      <SelectField
        label={t('bulk.kind')}
        disabled={disabled}
        value={receipt.kind}
        options={[
          { value: 'Purchase', label: t('newPurchase') },
          { value: 'Opening', label: t('openingStock') },
        ]}
        onChange={(kind) => {
          if (kind === 'Purchase' || kind === 'Opening')
            onReceiptChange({
              kind,
              ...(kind === 'Opening' ? { supplierId: null, supplierInvoiceNo: null } : {}),
            });
        }}
      />
      {receipt.kind === 'Purchase' ? (
        <>
          {suppliers.error ? (
            <Alert
              tone="danger"
              title={message(suppliers.error)}
              description={<Button onClick={() => void suppliers.refetch()}>{t('retry')}</Button>}
            />
          ) : null}
          <SelectField
            label={t('supplier')}
            optional
            value={receipt.supplierId ?? ''}
            disabled={disabled || suppliers.isPending}
            options={(suppliers.data ?? []).map((s) => ({ value: s.id, label: s.name }))}
            onChange={(supplierId) => onReceiptChange({ supplierId: supplierId || null })}
          />
          <TextField
            label={t('supplierInvoice')}
            optional
            maxLength={40}
            value={receipt.supplierInvoiceNo ?? ''}
            disabled={disabled}
            onChange={(supplierInvoiceNo) =>
              onReceiptChange({ supplierInvoiceNo: supplierInvoiceNo || null })
            }
          />
        </>
      ) : null}
      <DateField
        label={t('bulk.documentDate')}
        optional
        value={(receipt.documentDate ?? '') as DateOnly | ''}
        max={todayDateOnly()}
        disabled={disabled}
        onChange={(documentDate) => onReceiptChange({ documentDate: documentDate || null })}
      />
    </>
  );
}
