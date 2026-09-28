'use client';
import { SelectField, useToast } from '@dukani/ui-kit';
import { useCreateSupplier } from '../hooks/use-create-supplier';
import { useSuppliers } from '../hooks/use-suppliers';

/** Supplier select with «ثبت تأمین‌کنندهٔ جدید» from the search text (F71). */
export function SupplierField({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const suppliers = useSuppliers();
  const create = useCreateSupplier();
  const toast = useToast();
  return (
    <SelectField
      label="تأمین‌کننده"
      optional
      searchable
      value={value}
      onChange={onChange}
      placeholder="انتخاب تأمین‌کننده"
      options={(suppliers.data ?? []).map((x) => ({ value: x.id, label: x.name, description: x.phone ?? undefined }))}
      createAction={{
        label: 'ثبت تأمین‌کنندهٔ جدید',
        onSelect: async (name) => {
          if (!name.trim()) return toast('نام تأمین‌کننده را در جست‌وجو بنویسید.', 'danger');
          try {
            const s = await create.mutateAsync(name.trim());
            onChange(s.id);
            toast(`«${s.name}» ثبت شد.`, 'success');
          } catch (e) {
            toast((e as { message?: string }).message ?? 'ثبت نشد.', 'danger');
          }
        },
      }}
    />
  );
}
