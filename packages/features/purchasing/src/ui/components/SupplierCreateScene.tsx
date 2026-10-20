'use client';
import type { Dto } from '@dukani/contracts';
import { isAppError } from '@dukani/domain';
import { useLocalizedAppForm as useAppForm, useValidationRules } from '@dukani/forms';
import { Alert, Button, FormScene, TextArea, TextField, useAppErrorMessage } from '@dukani/ui-kit';
import { useState } from 'react';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';
import { useCreateSupplier } from '../hooks/use-create-supplier';
import { supplierCreateSchemaFor } from './SupplierCreate.schema';

/**
 * Create a supplier in place (SUPPLIER-CREATE): name, phone and note as the API takes them; on success the new
 * supplier is chosen and the purchase underneath is exactly as it was. Cancel or a failure leaves it untouched.
 * Creating a supplier records no purchase or debt.
 */
export function SupplierCreateScene({
  open,
  initialName,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  initialName: string;
  onOpenChange: (open: boolean) => void;
  onCreated: (supplier: Dto<'SupplierDto'>) => void;
}) {
  const t = usePurchaseTranslations();
  const errorMessage = useAppErrorMessage();
  const create = useCreateSupplier();
  const [error, setError] = useState<string | null>(null);
  const form = useAppForm({
    schema: supplierCreateSchemaFor(t, useValidationRules()),
    defaultValues: { name: initialName, phone: '', note: '' },
  });
  const submit = form.handleSubmit(async (v) => {
    setError(null);
    try {
      const supplier = await create.mutateAsync({
        name: v.name,
        phone: v.phone || null,
        note: v.note || null,
      });
      onCreated(supplier);
      onOpenChange(false);
    } catch (e) {
      if (isAppError(e) && form.applyServerError(e)) return;
      setError(isAppError(e) ? errorMessage(e) : t('notRecorded'));
    }
  });
  return (
    <FormScene
      open={open}
      onOpenChange={onOpenChange}
      title={t('supplierCreate.title')}
      description={t('supplierCreate.hint')}
      actions={
        <>
          <Button loading={create.isPending} onClick={() => void submit()}>
            {t('supplierCreate.save')}
          </Button>
          <Button variant="secondary" disabled={create.isPending} onClick={() => onOpenChange(false)}>
            {t('back')}
          </Button>
        </>
      }
    >
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        {error ? <Alert tone="danger" title={error} /> : null}
        <form.Field name="name">
          {(f) => <TextField {...f} label={t('supplierCreate.name')} required maxLength={160} autoFocus />}
        </form.Field>
        <form.Field name="phone">
          {(f) => (
            <TextField
              {...f}
              label={t('supplierCreate.phone')}
              optional
              filter="digits"
              asciiDigits
              inputMode="tel"
              maxLength={20}
              dir="ltr"
            />
          )}
        </form.Field>
        <form.Field name="note">
          {(f) => <TextArea {...f} label={t('supplierCreate.note')} optional maxLength={500} />}
        </form.Field>
      </form>
    </FormScene>
  );
}
