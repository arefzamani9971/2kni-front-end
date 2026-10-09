'use client';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';

import { SelectField, useToast } from '@dukani/ui-kit';
import { useCreateSupplier } from '../hooks/use-create-supplier';
import { useSuppliers } from '../hooks/use-suppliers';

/** Supplier select with «ثبت تأمین‌کنندهٔ جدید» from the search text (F71). */
export function SupplierField({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const t = usePurchaseTranslations();

  const suppliers = useSuppliers();
  const create = useCreateSupplier();
  const toast = useToast();
  return (
    <SelectField
      label={t('supplier')}
      optional
      searchable
      value={value}
      onChange={onChange}
      placeholder={t('chooseSupplier')}
      options={(suppliers.data ?? []).map((x) => ({
        value: x.id,
        label: x.name,
        description: x.phone ?? undefined,
      }))}
      createAction={{
        label: t('newSupplier'),
        onSelect: async (name) => {
          if (!name.trim()) return toast(t('supplierHint'), 'danger');
          try {
            const s = await create.mutateAsync(name.trim());
            onChange(s.id);
            toast(t('supplierCreated', { name: s.name }), 'success');
          } catch (e) {
            toast((e as { message?: string }).message ?? t('notRecorded'), 'danger');
          }
        },
      }}
    />
  );
}
