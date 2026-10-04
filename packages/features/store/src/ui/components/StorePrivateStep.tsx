'use client';
import { useAppForm } from '@dukani/forms';
import {
  Button,
  CardNumberField,
  FlowShell,
  FormColumn,
  NationalIdField,
  Section,
  ShebaField,
  TextField,
} from '@dukani/ui-kit';
import type { StorePrivateDraft } from '../../domain/store-draft.types';
import { privateSchema } from './StorePrivateStep.schema';

/**
 * storelegal «مالک و تسویه · ۲ از ۲» (Figma 358:482; desktop layout 358:5345). Values stay in
 * memory until they are sent with `PUT /private-info` on the created store — never in a local draft.
 */
export function StorePrivateStep({
  value,
  onSave,
  onSkip,
}: {
  value: StorePrivateDraft | null;
  onSave: (value: StorePrivateDraft) => void;
  onSkip: () => void;
}) {
  const form = useAppForm({
    schema: privateSchema,
    defaultValues: {
      ownerName: value?.ownerName ?? '',
      licenseNo: value?.licenseNo ?? '',
      nationalId: value?.nationalId ?? '',
      accountNumber: value?.accountNumber ?? '',
      cardNumber: value?.cardNumber ?? '',
      iban: value?.iban ?? '',
    },
  });
  const save = form.handleSubmit((v) => onSave(v));

  return (
    <form noValidate onSubmit={save} className="contents">
      <FlowShell
        appBar={{ title: 'مالک و تسویه · ۲ از ۲', back: onSkip }}
        actions={
          <>
            <Button type="submit" block>
              ذخیره
            </Button>
            <Button type="button" variant="secondary" block onClick={onSkip}>
              بعداً تکمیل می‌کنم
            </Button>
          </>
        }
      >
        <FormColumn size="lg">
          <Section collapsible title="اطلاعات مالک و بانکی" className="gap-4">
            <form.Field name="ownerName">
              {(f) => (
                <TextField
                  {...f}
                  label="نام مالک"
                  optional
                  placeholder="نام و نام خانوادگی"
                  maxLength={160}
                />
              )}
            </form.Field>
            <form.Field name="licenseNo">
              {(f) => (
                <TextField {...f} label="شناسه مجوز کسب" optional placeholder="شناسه مجوز" maxLength={64} />
              )}
            </form.Field>
            <form.Field name="nationalId">
              {(f) => <NationalIdField {...f} label="کد ملی مالک" optional placeholder="کد ملی ۱۰ رقمی" />}
            </form.Field>
            <form.Field name="accountNumber">
              {(f) => (
                <TextField
                  {...f}
                  label="شماره حساب"
                  optional
                  inputMode="numeric"
                  filter="digits"
                  asciiDigits
                  transform={(r) => r.replace(/[\s-]/g, '')}
                  dir="ltr"
                  placeholder="شماره حساب"
                  maxLength={34}
                />
              )}
            </form.Field>
            <form.Field name="cardNumber">
              {(f) => <CardNumberField {...f} label="شماره کارت" optional placeholder="شماره کارت ۱۶ رقمی" />}
            </form.Field>
            <form.Field name="iban">
              {(f) => <ShebaField {...f} label="شماره شبا" optional placeholder="" />}
            </form.Field>
            <p className="text-body-s text-fg-secondary">
              اطلاعات مالک و بانکی در صفحه عمومی فروشگاه نمایش داده نمی‌شوند.
            </p>
          </Section>
        </FormColumn>
      </FlowShell>
    </form>
  );
}
