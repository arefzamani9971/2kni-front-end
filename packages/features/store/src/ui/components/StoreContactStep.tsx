'use client';
import { useValidationRules } from '@dukani/forms';
import { useStoreTranslations } from '../i18n/use-store-translations';

import { useLocalizedAppForm as useAppForm } from '@dukani/forms';
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
import { useStorePresentation } from '../i18n/use-store-presentation';
import type { StoreContactDraft, StoreHoursPlan } from '../../domain/store-draft.types';
import { contactSchema } from './StoreContactStep.schema';
import type { ContactStepTarget, StepContext } from './StoreContactStep.types';
import { createStepCopy } from './store-steps.constants';
import type { ReactNode } from 'react';

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
  context = 'setup',
  busy = false,
  banner,
  logoBusy = false,
  logoUrl = null,
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
  context?: StepContext;
  /** A save of this step is running (F03 saves at once). */
  busy?: boolean;
  /** Save/upload result of the host flow (error, conflict). */
  banner?: ReactNode;
  logoBusy?: boolean;
  /** The saved logo of an existing store (F03), shown until another file is picked. */
  logoUrl?: string | null;
}) {
  const t = useStoreTranslations();
  const presentation = useStorePresentation();

  const copy = createStepCopy(t)[context];
  const validationRules = useValidationRules();
  const form = useAppForm({
    schema: contactSchema(t, validationRules),
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
        appBar={{ title: copy.contactTitle, back: onSkip }}
        banner={banner}
        actions={
          <>
            <Button type="submit" block loading={busy} disabled={logoBusy}>
              {copy.contactSave}
            </Button>
            <Button type="button" variant="secondary" block onClick={onSkip} disabled={busy}>
              {copy.leave}
            </Button>
          </>
        }
      >
        <FormColumn
          size="lg"
          wide={
            <UploadArea
              title={t('optionalPhoto')}
              description={t('choosePhoto')}
              value={logo}
              currentUrl={logoUrl ?? undefined}
              onChange={onLogo}
            />
          }
        >
          <Section collapsible title={t('contactAddress')} className="gap-4">
            <form.Field name="phone">
              {(f) => (
                <TextField
                  {...f}
                  label={t('publicPhone')}
                  optional
                  type="tel"
                  inputMode="tel"
                  filter="digits"
                  asciiDigits
                  dir="ltr"
                  placeholder={t('storePhone')}
                  maxLength={24}
                />
              )}
            </form.Field>
            <form.Field name="email">
              {(f) => (
                <TextField
                  {...f}
                  label={t('email')}
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
              {(f) => (
                <TextField
                  {...f}
                  label={t('address')}
                  optional
                  placeholder={t('storeAddress')}
                  maxLength={400}
                />
              )}
            </form.Field>
            <form.Field name="postalCode">
              {(f) => (
                <PostalCodeField {...f} label={t('postalCode')} optional placeholder={t('postalCodeHint')} />
              )}
            </form.Field>
            <PickerField
              label={t('openingHours')}
              optional
              placeholder={t('chooseHours')}
              display={hours ? presentation.hours(hours) : undefined}
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
            {t('optionalLocation')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            block
            className={INLINE_ACTION}
            onClick={() => open('hours')}
          >
            {t('editHours')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            block
            className={INLINE_ACTION}
            onClick={() => open('private')}
          >
            {t('optionalPrivate')}
          </Button>
        </FormColumn>
      </FlowShell>
    </form>
  );
}
