'use client';
import { useValidationRules } from '@dukani/forms';
import { useStoreTranslations } from '../i18n/use-store-translations';

import { useLocalizedAppForm as useAppForm } from '@dukani/forms';
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
import type { StepContext } from './StoreContactStep.types';
import { createStepCopy } from './store-steps.constants';
import type { ReactNode } from 'react';

/**
 * storelegal «مالک و تسویه · ۲ از ۲» (Figma 358:482; desktop layout 358:5345). Values stay in
 * memory until they are sent with `PUT /private-info` on the created store — never in a local draft.
 */
export function StorePrivateStep({
  value,
  onSave,
  onSkip,
  context = 'setup',
  busy = false,
  banner,
}: {
  value: StorePrivateDraft | null;
  onSave: (value: StorePrivateDraft) => void;
  onSkip: () => void;
  context?: StepContext;
  busy?: boolean;
  banner?: ReactNode;
}) {
  const t = useStoreTranslations();

  const copy = createStepCopy(t)[context];
  const validationRules = useValidationRules();
  const form = useAppForm({
    schema: privateSchema(t, validationRules),
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
        appBar={{ title: copy.privateTitle, back: onSkip }}
        banner={banner}
        actions={
          <>
            <Button type="submit" block loading={busy}>
              {copy.privateSave}
            </Button>
            <Button type="button" variant="secondary" block onClick={onSkip} disabled={busy}>
              {copy.leave}
            </Button>
          </>
        }
      >
        <FormColumn size="lg">
          <Section collapsible title={t('privateDetails')} className="gap-4">
            <form.Field name="ownerName">
              {(f) => (
                <TextField
                  {...f}
                  label={t('ownerName')}
                  optional
                  placeholder={t('fullName')}
                  maxLength={160}
                />
              )}
            </form.Field>
            <form.Field name="licenseNo">
              {(f) => (
                <TextField
                  {...f}
                  label={t('businessLicense')}
                  optional
                  placeholder={t('license')}
                  maxLength={64}
                />
              )}
            </form.Field>
            <form.Field name="nationalId">
              {(f) => (
                <NationalIdField
                  {...f}
                  label={t('ownerNationalId')}
                  optional
                  placeholder={t('nationalIdHint')}
                />
              )}
            </form.Field>
            <form.Field name="accountNumber">
              {(f) => (
                <TextField
                  {...f}
                  label={t('accountNumber')}
                  optional
                  inputMode="numeric"
                  filter="digits"
                  asciiDigits
                  transform={(r) => r.replace(/[\s-]/g, '')}
                  dir="ltr"
                  placeholder={t('accountNumber')}
                  maxLength={34}
                />
              )}
            </form.Field>
            <form.Field name="cardNumber">
              {(f) => <CardNumberField {...f} label={t('cardNumber')} optional placeholder={t('cardHint')} />}
            </form.Field>
            <form.Field name="iban">
              {(f) => <ShebaField {...f} label={t('iban')} optional placeholder="" />}
            </form.Field>
            <p className="text-body-s text-fg-secondary">{t('privateHint')}</p>
          </Section>
        </FormColumn>
      </FlowShell>
    </form>
  );
}
