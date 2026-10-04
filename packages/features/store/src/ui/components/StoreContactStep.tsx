'use client';
import { toPersianDigits } from '@dukani/domain';
import { useAppForm } from '@dukani/forms';
import {
  Button,
  FlowShell,
  FormColumn,
  INLINE_ACTION,
  PickerField,
  PostalCodeField,
  Section,
  TextField,
  UploadArea,
} from '@dukani/ui-kit';
import { describeHours } from '../../domain/store-draft';
import type { StoreContactDraft, StoreHoursPlan } from '../../domain/store-draft.types';
import { contactSchema } from './StoreContactStep.schema';
import type { ContactStepTarget } from './StoreContactStep.types';

/**
 * storeprofile «تماس و نشانی · ۱ از ۲» (Figma 358:481; desktop layout 358:5344), inside the
 * pending draft: nothing is sent before «ساخت فروشگاه». Mobile «ذخیره و ادامه» goes on to step ۲ (owner and
 * bank) in every viewport — the desktop frame's «ذخیره اطلاعات» belongs to the F03 edit flow, not this wizard.
 * «بعداً تکمیل می‌کنم» drops this screen's edits.
 */
export function StoreContactStep({
  value,
  hours,
  logo,
  onLogo,
  onSave,
  onOpen,
  onSkip,
}: {
  value: StoreContactDraft | null;
  hours: StoreHoursPlan | null;
  logo: File | null;
  onLogo: (file: File | null) => void;
  /** Saves and opens step ۲ (owner and bank). */
  onSave: (contact: StoreContactDraft) => void;
  /** Opens a sub-step after saving the valid values here. */
  onOpen: (target: ContactStepTarget, contact: StoreContactDraft) => void;
  onSkip: () => void;
}) {
  const form = useAppForm({
    schema: contactSchema,
    defaultValues: {
      phone: value?.phone ?? '',
      email: value?.email ?? '',
      addressLine: value?.addressLine ?? '',
      postalCode: value?.postalCode ?? '',
    },
  });
  const save = form.handleSubmit((v) => onSave(v));
  const open = (target: ContactStepTarget) => form.handleSubmit((v) => onOpen(target, v))();

  return (
    <form noValidate onSubmit={save} className="contents">
      <FlowShell
        appBar={{ title: 'تماس و نشانی · ۱ از ۲', back: onSkip }}
        actions={
          <>
            <Button type="submit" block>
              ذخیره و ادامه
            </Button>
            <Button type="button" variant="secondary" block onClick={onSkip}>
              بعداً تکمیل می‌کنم
            </Button>
          </>
        }
      >
        <FormColumn
          size="lg"
          wide={
            <UploadArea
              title="عکس فروشگاه (اختیاری)"
              description="انتخاب یا تغییر تصویر فروشگاه"
              value={logo}
              onChange={onLogo}
            />
          }
        >
          <Section collapsible title="تماس و نشانی" className="gap-4">
            <form.Field name="phone">
              {(f) => (
                <TextField
                  {...f}
                  label="تلفن تماس عمومی"
                  optional
                  type="tel"
                  inputMode="tel"
                  filter="digits"
                  asciiDigits
                  dir="ltr"
                  placeholder="شماره تماس فروشگاه"
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
                  placeholder="shop@example.com"
                  maxLength={160}
                />
              )}
            </form.Field>
            <form.Field name="addressLine">
              {(f) => <TextField {...f} label="نشانی" optional placeholder="نشانی فروشگاه" maxLength={400} />}
            </form.Field>
            <form.Field name="postalCode">
              {(f) => <PostalCodeField {...f} label="کد پستی" optional placeholder="کد پستی ۱۰ رقمی" />}
            </form.Field>
            <PickerField
              label="روزها و ساعات فعالیت"
              optional
              placeholder="انتخاب روز و ساعت"
              display={hours ? describeHours(hours, toPersianDigits) : undefined}
              onOpen={() => open('hours')}
            />
          </Section>
          <Button
            type="button"
            variant="secondary"
            block
            className={INLINE_ACTION}
            onClick={() => open('location')}
          >
            موقعیت فروشگاه (اختیاری)
          </Button>
          <Button
            type="button"
            variant="secondary"
            block
            className={INLINE_ACTION}
            onClick={() => open('hours')}
          >
            تنظیم روزها و ساعات فعالیت
          </Button>
          <Button
            type="button"
            variant="secondary"
            block
            className={INLINE_ACTION}
            onClick={() => open('private')}
          >
            اطلاعات مالک و بانکی (اختیاری)
          </Button>
        </FormColumn>
      </FlowShell>
    </form>
  );
}
