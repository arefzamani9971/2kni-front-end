import { Button, PageState, useAppErrorMessage } from '@dukani/ui-kit';
import type { AppError } from '@dukani/domain';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
export function CatalogQueryState({
  pending,
  error,
  retry,
}: {
  pending: boolean;
  error: AppError | null;
  retry: () => void;
}) {
  const t = useCatalogTexts();
  const message = useAppErrorMessage();
  if (error)
    return (
      <PageState
        kind={error.kind === 'Permission' ? 'permission' : 'error'}
        description={message(error)}
        action={
          <Button variant="secondary" onClick={retry}>
            {t('retry')}
          </Button>
        }
      />
    );
  return pending ? <PageState kind="loading" rows={3} /> : null;
}
