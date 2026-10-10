import { Alert, Button } from '@dukani/ui-kit';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
/** Actionable duplicate conflict: pick the existing record or keep editing the name. */
export function DuplicateChoice({ name, onUse }: { name: string; onUse: () => void }) {
  const t = useCatalogTexts();
  return (
    <Alert
      tone="warning"
      title={t('duplicateFound', { name })}
      action={
        <Button variant="secondary" onClick={onUse}>
          {t('useExisting')}
        </Button>
      }
    />
  );
}
