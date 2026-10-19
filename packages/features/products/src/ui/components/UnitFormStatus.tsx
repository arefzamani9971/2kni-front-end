'use client';
import { Alert, Button, useAppErrorMessage } from '@dukani/ui-kit';
import type { useUnitCommand } from '../hooks/use-unit-command';
import { useProductTranslations } from '../i18n/use-product-translations';
import { UNIT_FIELD_CODES } from './UnitFormStatus.constants';

/**
 * Save outcome of the unit form: unknown result with «بررسی دوباره» (the same Idempotency-Key), a stale product
 * (the fresh one is already loaded, the input kept), or a failure that has no field to sit next to.
 */
export function UnitFormStatus({ command }: { command: ReturnType<typeof useUnitCommand> }) {
  const t = useProductTranslations();
  const errorMessage = useAppErrorMessage();
  const { state } = command;
  if (state.kind === 'unknown')
    return (
      <Alert
        tone="warning"
        title={t('units.unknownTitle')}
        description={t('units.unknownHint')}
        action={
          <Button variant="secondary" loading={command.busy} onClick={() => void command.retry()}>
            {t('units.checkAgain')}
          </Button>
        }
      />
    );
  if (command.conflict)
    return <Alert tone="warning" title={t('units.conflictTitle')} description={t('units.conflictHint')} />;
  if (state.kind === 'failed' && state.error.kind !== 'Validation' && !UNIT_FIELD_CODES.has(state.error.code))
    return <Alert tone="danger" title={t('units.failed')} description={errorMessage(state.error)} />;
  return null;
}
