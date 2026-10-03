'use client';
import { useAppForm } from '@dukani/forms';

import {
  Alert,
  Button,
  Chip,
  ChipGroup,
  PageState,
  PickerField,
  Screen,
  ScreenHeader,
  Section,
  StickyActionBar,
  TextField,
} from '@dukani/ui-kit';
import { useEffect, useState } from 'react';

import { BUSINESS_MODE_LABELS } from '../../domain/store.constants';
import type { BusinessMode } from '../../domain/store.types';
import { useCreateStore } from '../hooks/use-create-store';
import { useStoreTypes } from '../hooks/use-store-types';
import type { CreateStoreScreenProps } from './CreateStoreScreen.types';
import { StoreTypeStep } from '../components/StoreTypeStep';
import { schema } from './CreateStoreScreen.schema';

/** setup (Figma 312:8744) + ST02 store type (385:6827): name and type are enough to start (F02). */
export function CreateStoreScreen({ onCreated, onBack, onMoreInfo }: CreateStoreScreenProps) {
  const types = useStoreTypes();
  const [picking, setPicking] = useState(false);
  const form = useAppForm({
    schema,
    defaultValues: { name: '', storeTypeId: '', businessMode: 'Retail' as BusinessMode },
  });
  const create = useCreateStore(onCreated);
  const typeId = form.watch('storeTypeId');
  const selectedType = types.data?.find((t) => t.id === typeId);

  const submit = form.handleSubmit(async (v) => {
    await create.submit({ name: v.name, storeTypeId: v.storeTypeId, businessMode: v.businessMode });
  });
  const failed = create.state.kind === 'failed' ? create.state.error : null;
  useEffect(() => {
    if (failed?.fieldErrors) form.applyServerError(failed);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply once per failure
  }, [failed]);

  if (picking)
    return (
      <StoreTypeStep
        types={types.data ?? []}
        loading={types.isPending}
        value={typeId}
        onBack={() => setPicking(false)}
        onPick={(t) => {
          form.setValue('storeTypeId', t.id);
          setPicking(false);
        }}
      />
    );

  return (
    <form noValidate onSubmit={submit} className="contents">
      <Screen
        header={<ScreenHeader title="ایجاد سریع فروشگاه" subtitle="نام و نوع فروشگاه برای شروع کافی است." />}
        actions={
          <StickyActionBar>
            <Button type="submit" block loading={create.busy}>
              ساخت فروشگاه
            </Button>
            <Button type="button" variant="secondary" block onClick={onBack}>
              بازگشت
            </Button>
          </StickyActionBar>
        }
      >
        {failed && !failed.fieldErrors ? (
          <Alert title="فروشگاه ساخته نشد" description={failed.message} />
        ) : null}
        {create.state.kind === 'unknown' ? (
          <PageState
            kind="unknown-result"
            action={
              <Button variant="secondary" onClick={() => void create.retry()}>
                بررسی دوباره
              </Button>
            }
          />
        ) : null}
        <Section title="اطلاعات فروشگاه">
          <form.Field name="name">
            {(f) => <TextField {...f} label="نام فروشگاه" required maxLength={80} autoFocus />}
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
                display={selectedType ? `${selectedType.name} · تغییر نوع` : undefined}
                placeholder="انتخاب نوع"
                onOpen={() => setPicking(true)}
              />
            )}
          </form.Field>
        </Section>
        {onMoreInfo ? (
          <Button type="button" variant="secondary" block onClick={onMoreInfo}>
            ثبت بقیه اطلاعات (اختیاری)
          </Button>
        ) : null}
        <form.Field name="businessMode">
          {(f) => (
            <ChipGroup label="شیوهٔ فعالیت">
              {(Object.keys(BUSINESS_MODE_LABELS) as BusinessMode[]).map((m) => (
                <Chip key={m} selected={f.value === m} onClick={() => f.onChange(m)}>
                  {BUSINESS_MODE_LABELS[m]}
                </Chip>
              ))}
            </ChipGroup>
          )}
        </form.Field>
      </Screen>
    </form>
  );
}
