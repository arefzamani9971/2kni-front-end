'use client';
import { useNavigation } from '@dukani/platform';
import { FlowShell, FormColumn } from '@dukani/ui-kit';
import { correctionActions } from '../../domain/correction';
import { CatalogQueryState } from '../components/CatalogQueryState';
import { CorrectionChanges } from '../components/CorrectionChanges';
import { CorrectionResponseForm } from '../components/CorrectionResponseForm';
import { CorrectionSummary } from '../components/CorrectionSummary';
import { CorrectionTimeline } from '../components/CorrectionTimeline';
import { CorrectionWithdraw } from '../components/CorrectionWithdraw';
import { useCorrection } from '../hooks/use-correction';
import { useCorrectionCapabilities } from '../hooks/use-correction-capabilities';
import { useCatalogTexts } from '../i18n/use-catalog-translations';

/**
 * `~/catalog/corrections/[correctionId]` (F11 §7): status, proposed changes and history of one request, with the
 * seller's next step for that status. Accepted is a catalog decision; past invoices and receipts keep their snapshot.
 */
export function CorrectionDetailScreen({ correctionId }: { correctionId: string }) {
  const t = useCatalogTexts();
  const nav = useNavigation();
  const correction = useCorrection(correctionId);
  const c = correction.data;
  // names of fields and options; an archived item can no longer be read, so keys are shown as they are
  const capabilities = useCorrectionCapabilities(c?.catalogItemId);
  const actions = c ? correctionActions(c.status) : null;
  return (
    <FlowShell appBar={{ title: t('correctionStatus.title'), back: nav.back }}>
      <CatalogQueryState
        pending={correction.isPending}
        error={correction.error}
        retry={() => void correction.refetch()}
      />
      {c && actions ? (
        <FormColumn size="lg">
          <CorrectionSummary correction={c} />
          <CorrectionChanges changes={c.proposedChanges} fields={capabilities.data?.fields ?? []} />
          <CorrectionTimeline history={c.history} />
          {actions.reply ? <CorrectionResponseForm correctionId={c.id} kind="reply" /> : null}
          {actions.appeal ? <CorrectionResponseForm correctionId={c.id} kind="appeal" /> : null}
          {actions.withdraw ? <CorrectionWithdraw correctionId={c.id} /> : null}
        </FormColumn>
      ) : null}
    </FlowShell>
  );
}
