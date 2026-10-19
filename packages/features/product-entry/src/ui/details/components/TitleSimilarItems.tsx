'use client';
import { useEffect } from 'react';
import { useFieldValue } from '@dukani/forms';
import { useSearchTerm } from '@dukani/platform';
import { Alert } from '@dukani/ui-kit';
import { useTitleCheck } from '../hooks/use-title-check';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import { SimilarItem } from './SimilarItem';
import type { TitleSimilarItemsProps } from '../types/TitleSimilarItems.types';

/**
 * Similar catalog items for the typed title (F10 §11) under the shared suggestion policy (3 meaningful characters,
 * 300ms): only this leaf follows the title, so typing does not re-render the details form. A taken title closes the
 * register gate through `availabilityRef`; similar titles only warn.
 */
export function TitleSimilarItems({ form, availabilityRef, onPickSimilar }: TitleSimilarItemsProps) {
  const t = useEntryTranslations();
  const { term } = useSearchTerm(useFieldValue(form, 'title'));
  const check = useTitleCheck(term);
  const data = term ? check.data : undefined;
  useEffect(() => {
    availabilityRef.current = !(data && !data.isAvailable);
  }, [data, availabilityRef]);
  const similar = data?.similarItems ?? [];
  if (!similar.length) return null;
  return (
    <Alert
      tone={data?.isAvailable ? 'warning' : 'danger'}
      title={data?.isAvailable ? t('similarCatalog') : t('titleExists')}
      description={
        <div className="flex flex-col gap-2">
          <span>{t('selectExistingHint')}</span>
          {similar.slice(0, 3).map((item) => (
            <SimilarItem key={item.id} item={item} onPick={() => onPickSimilar(item)} />
          ))}
        </div>
      }
    />
  );
}
