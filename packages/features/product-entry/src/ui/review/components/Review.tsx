'use client';
import { useState } from 'react';
import { fromApiMoney, todayDateOnly } from '@dukani/domain';
import { Button, Checkbox } from '@dukani/ui-kit';
import type { EntryDraft } from '../../../domain/entry-draft.types';
import { useAddToBulk } from '../hooks/use-add-to-bulk';
import { useEntryNav } from '../../common/hooks/use-entry-nav';
import { useEntryRegistration } from '../hooks/use-entry-registration';
import { useRegisterPreview } from '../hooks/use-register-preview';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import { BackButton } from '../../common/components/BackButton';
import { EntryReviewShell } from './EntryReviewShell';
import type { Save } from '../../common/types/use-entry-draft.types';
import { ReviewStatus } from './ReviewStatus';
import { ReviewSummary } from './ReviewSummary';
import { ReviewWarnings } from './ReviewWarnings';

/**
 * The entry's last step (F10 review; identity review of a standalone registration): the server preview, its state
 * and summary, and «تأیید» — the idempotent register, or the bulk draft when the entry came from bulk entry. An expired
 * stock asks for an explicit acknowledgement first.
 */
export function Review({ draft, save }: { draft: EntryDraft; save: Save }) {
  const t = useEntryTranslations();
  const go = useEntryNav();
  const preview = useRegisterPreview(draft);
  const register = useEntryRegistration(draft, save);
  const bulk = useAddToBulk(draft);
  const [expiredConfirmed, setExpiredConfirmed] = useState(false);
  const expired =
    draft.intent !== 'standalone' && !!draft.stock?.expiryDate && draft.stock.expiryDate < todayDateOnly();
  const p = preview.preview.data;
  const blocked =
    !p ||
    preview.preview.isError ||
    preview.preview.isFetching ||
    (expired && !expiredConfirmed) ||
    !p.titleCheck.isAvailable ||
    register.state.kind === 'succeeded' ||
    register.unknown;
  const locked = register.busy || !!draft.pending;

  return (
    <EntryReviewShell
      draft={draft}
      salePrice={p?.salePriceAmount != null ? fromApiMoney(p.salePriceAmount) : null}
      onBack={go.back}
      locked={locked}
      title={t(draft.intent === 'standalone' ? 'identityReview' : 'review')}
      actions={
        <>
          <Button
            block
            loading={register.busy}
            disabled={blocked}
            onClick={() => void (draft.bulkHost ? bulk.add() : register.submit())}
          >
            {t('confirm')}
          </Button>
          <BackButton onClick={go.back} disabled={locked} />
        </>
      }
    >
      <ReviewStatus
        draft={draft}
        save={save}
        preview={preview}
        register={register}
        startError={bulk.error ?? register.draftError}
      />
      {p ? (
        <>
          {expired ? (
            <Checkbox checked={expiredConfirmed} onChange={setExpiredConfirmed} label={t('expiredConfirm')} />
          ) : null}
          <ReviewSummary draft={draft} preview={p} />
          <ReviewWarnings draft={draft} warnings={p.warnings} />
        </>
      ) : null}
    </EntryReviewShell>
  );
}
