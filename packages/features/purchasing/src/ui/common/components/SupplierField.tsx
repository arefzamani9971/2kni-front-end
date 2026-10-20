'use client';
import { SelectField } from '@dukani/ui-kit';
import { useState } from 'react';
import { usePurchaseTranslations } from '../../i18n/use-purchase-translations';
import { useSuppliers } from '../hooks/use-suppliers';
import { SupplierCreateScene } from './SupplierCreateScene';

/**
 * SUPPLIER-SELECT: optional supplier of this receipt; only active suppliers are offered (an archived one stays
 * readable on old receipts only). «تأمین‌کنندهٔ جدید» opens the in-place creation with the typed name; the receipt
 * underneath keeps everything, and the created supplier is chosen.
 */
export function SupplierField({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const t = usePurchaseTranslations();
  const suppliers = useSuppliers();
  const [creating, setCreating] = useState<string | null>(null);
  return (
    <>
      <SelectField
        label={t('supplier')}
        optional
        searchable
        disabled={disabled}
        value={value}
        onChange={onChange}
        placeholder={t('chooseSupplier')}
        options={(suppliers.data ?? [])
          .filter((x) => !x.isArchived)
          .map((x) => ({ value: x.id, label: x.name, description: x.phone ?? undefined }))}
        createAction={{ label: t('newSupplier'), onSelect: (name) => setCreating(name.trim()) }}
      />
      {creating !== null ? (
        <SupplierCreateScene
          open
          initialName={creating}
          onOpenChange={(open) => !open && setCreating(null)}
          onCreated={(supplier) => onChange(supplier.id)}
        />
      ) : null}
    </>
  );
}
