'use client';
import { useAppForm } from '@dukani/forms';
import {
  Alert,
  Button,
  Chip,
  ChipGroup,
  FlowShell,
  INLINE_ACTION,
  ListRow,
  PageState,
  PickerField,
  ScreenHeader,
  Section,
  TextField,
  TwoColumnWorkspace,
} from '@dukani/ui-kit';
import { useEffect } from 'react';

import type { StoreType } from '../../application/ports';
import { BUSINESS_MODE_LABELS } from '../../domain/store.constants';
import type { BusinessMode } from '../../domain/store.types';
import type { StoreSetup } from '../hooks/use-store-setup.types';
import { schema } from '../screens/CreateStoreScreen.schema';

/**
 * setup «ایجاد سریع فروشگاه» (Figma 312:8744; desktop 312:201 layout — «Two-column workspace» with the «آمادهٔ شروع»
 * card, which is desktop-only by CSS). One text and one behavior in every viewport: the desktop frame's other
 * title/label («راه‌اندازی فروشگاه», «اطلاعات تکمیلی فروشگاه») is a Figma inconsistency, not a second flow. Only name + type are required; business mode is sent explicitly (Retail by default, F02-S02).
 * The old desktop frame asks the seller's mobile again — that field is not built (F02 §3, AC08).
 */
export function StoreSetupForm({
  setup,
  types,
  onPickType,
  onMoreInfo,
  onBack,
}: {
  setup: StoreSetup;
  types: readonly StoreType[];
  onPickType: () => void;
  onMoreInfo: () => void;
  onBack: () => void;
}) {
  const draft = setup.draft!;
  const unknown = setup.createState.kind === 'unknown';
  // while a create result is unknown, name/type stay exactly as sent (F02 §11)
  const locked = unknown || setup.busy;
  const form = useAppForm({
    schema,
    defaultValues: { name: draft.name, storeTypeId: draft.storeTypeId, businessMode: draft.businessMode },
  });
  const typeId = form.watch('storeTypeId');
  const selectedType = types.find((t) => t.id === typeId);
  useEffect(() => {
    if (draft.storeTypeId !== form.getValues().storeTypeId) form.setValue('storeTypeId', draft.storeTypeId);
  }, [draft.storeTypeId, form]);

  const failed = setup.createState.kind === 'failed' ? setup.createState.error : null;
  useEffect(() => {
    if (failed?.fieldErrors) form.applyServerError(failed);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply once per failure
  }, [failed]);

  const submit = form.handleSubmit(async (v) => {
    setup.update({ name: v.name, storeTypeId: v.storeTypeId, businessMode: v.businessMode });
    await setup.create();
  });

  return (
    <form noValidate onSubmit={submit} className="contents">
      <FlowShell
        header={<ScreenHeader title="ایجاد سریع فروشگاه" subtitle="نام و نوع فروشگاه برای شروع کافی است." />}
        actions={
          <>
            <Button type="submit" block loading={setup.busy} disabled={unknown}>
              ساخت فروشگاه
            </Button>
            <Button type="button" variant="secondary" block disabled={setup.busy} onClick={onBack}>
              بازگشت
            </Button>
          </>
        }
      >
        {failed && !failed.fieldErrors ? (
          <Alert title="فروشگاه ساخته نشد" description={failed.message} />
        ) : null}
        {unknown ? (
          <PageState
            kind="unknown-result"
            action={
              <Button variant="secondary" onClick={() => void setup.checkAgain()}>
                بررسی دوباره
              </Button>
            }
          />
        ) : null}
        <TwoColumnWorkspace
          secondary={
            <Section title="آمادهٔ شروع">
              <ListRow>کالا را جست‌وجو یا خودتان ثبت کنید.</ListRow>
              <ListRow>برای شروع نیازی به ساخت دسته‌بندی ندارید.</ListRow>
            </Section>
          }
          primary={
            <>
              <Section title="اطلاعات فروشگاه">
                <form.Field name="name">
                  {(f) => (
                    <TextField
                      {...f}
                      onChange={(v) => {
                        f.onChange(v);
                        setup.update({ name: v });
                      }}
                      label="نام فروشگاه"
                      required
                      maxLength={160}
                      autoFocus
                      readOnly={locked}
                    />
                  )}
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
                      disabled={locked}
                      display={selectedType ? `${selectedType.name} · انتخاب نوع` : undefined}
                      placeholder="انتخاب نوع"
                      onOpen={onPickType}
                    />
                  )}
                </form.Field>
              </Section>
              <Button type="button" variant="secondary" block className={INLINE_ACTION} onClick={onMoreInfo}>
                ثبت بقیه اطلاعات (اختیاری)
              </Button>
              <form.Field name="businessMode">
                {(f) => (
                  <ChipGroup label="شیوهٔ فعالیت">
                    {(Object.keys(BUSINESS_MODE_LABELS) as BusinessMode[]).map((m) => (
                      <Chip
                        key={m}
                        selected={f.value === m}
                        disabled={locked}
                        onClick={() => {
                          f.onChange(m);
                          setup.update({ businessMode: m });
                        }}
                      >
                        {BUSINESS_MODE_LABELS[m]}
                      </Chip>
                    ))}
                  </ChipGroup>
                )}
              </form.Field>
            </>
          }
        />
      </FlowShell>
    </form>
  );
}
