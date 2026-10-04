'use client';
import type { AppError } from '@dukani/domain';
import { useAppForm } from '@dukani/forms';
import { AppBar, Button, PageShell, PickerField, SelectField, TextField } from '@dukani/ui-kit';
import { useEffect, type ReactNode } from 'react';
import type { BusinessMode } from '../../domain/store.types';
import { BUSINESS_MODE_LABELS } from '../../domain/store.constants';
import { editSchema } from '../screens/StoreEditScreen.schema';
import type { StoreEditValues } from './StoreEditForm.types';

const MODES = (Object.keys(BUSINESS_MODE_LABELS) as BusinessMode[]).map((m) => ({ value: m, label: BUSINESS_MODE_LABELS[m] }));

/**
 * STORE-05 «ویرایش فروشگاه» (Figma 385:6912): the flush App Bar, the public fields in Figma order, the links to the
 * private sub-pages and to «عکس، کد پستی، موقعیت و ساعات فعالیت», then «ذخیره تغییرات». Opening a sub-page first
 * validates and keeps these values (nothing is lost when coming back).
 */
export function StoreEditForm({
  values,
  typeName,
  canEditPrivate,
  dirty,
  saving,
  serverError,
  banner,
  onPickType,
  onOpen,
  onSave,
  onBack,
}: {
  values: StoreEditValues;
  typeName: string | null;
  canEditPrivate: boolean;
  /** Edits from sub-pages that are not saved yet. */
  dirty: boolean;
  saving: boolean;
  serverError: AppError | null;
  banner?: ReactNode;
  onPickType: (values: StoreEditValues) => void;
  onOpen: (target: 'private' | 'contact', values: StoreEditValues) => void;
  onSave: (values: StoreEditValues) => void;
  /** `dirty` tells the host whether to ask before leaving (leaveform 594:6931). */
  onBack: (dirty: boolean) => void;
}) {
  const form = useAppForm({
    schema: editSchema,
    defaultValues: {
      name: values.name,
      storeTypeId: values.storeTypeId,
      businessMode: values.businessMode,
      phone: values.phone ?? '',
      email: values.email ?? '',
      addressLine: values.addressLine ?? '',
    },
  });
  useEffect(() => {
    if (serverError) form.applyServerError(serverError);
  }, [serverError, form]);

  const save = form.handleSubmit((v) => onSave(v));
  const open = (target: 'private' | 'contact') => form.handleSubmit((v) => onOpen(target, v))();

  return (
    <form noValidate onSubmit={save} className="contents">
      <PageShell
        title="ویرایش فروشگاه"
        header={<AppBar title="ویرایش فروشگاه" back={() => onBack(dirty || form.formState.isDirty)} />}
        banner={banner}
        contentClassName="gap-3"
      >
        <form.Field name="name">
          {(f) => <TextField {...f} label="نام فروشگاه" required maxLength={160} />}
        </form.Field>
        <form.Field name="storeTypeId">
          {(f) => (
            <PickerField
              id={f.id}
              name={f.name}
              ref={f.ref}
              status={f.status}
              message={f.message}
              label="نوع فروشگاه"
              required
              display={typeName ?? undefined}
              placeholder="انتخاب نوع"
              onOpen={() => form.handleSubmit((v) => onPickType(v))()}
            />
          )}
        </form.Field>
        <form.Field name="phone">
          {(f) => (
            <TextField
              {...f}
              label="شماره تماس"
              optional
              type="tel"
              inputMode="tel"
              filter="digits"
              asciiDigits
              dir="ltr"
              maxLength={24}
            />
          )}
        </form.Field>
        <form.Field name="email">
          {(f) => (
            <TextField
              {...f}
              label="ایمیل"
              optional
              type="email"
              inputMode="email"
              dir="ltr"
              autoComplete="email"
              maxLength={160}
            />
          )}
        </form.Field>
        <form.Field name="addressLine">
          {(f) => <TextField {...f} label="نشانی" optional maxLength={400} />}
        </form.Field>
        {canEditPrivate ? (
          <>
            <Button type="button" variant="secondary" block onClick={() => open('private')}>
              اطلاعات بانکی و تسویه
            </Button>
            <Button type="button" variant="secondary" block onClick={() => open('private')}>
              مجوز و اطلاعات مالک
            </Button>
          </>
        ) : null}
        <form.Field name="businessMode">
          {(f) => (
            <SelectField
              id={f.id}
              name={f.name}
              ref={f.ref}
              status={f.status}
              message={f.message}
              label="شیوه فعالیت"
              placeholder="خرده‌فروشی · عمده‌فروشی · هر دو"
              options={MODES}
              searchable={false}
              value={f.value ?? ''}
              onChange={f.onChange}
            />
          )}
        </form.Field>
        <Button type="button" variant="secondary" block onClick={() => open('contact')}>
          عکس، کد پستی، موقعیت و ساعات فعالیت
        </Button>
        <Button type="submit" block loading={saving}>
          ذخیره تغییرات
        </Button>
      </PageShell>
    </form>
  );
}
