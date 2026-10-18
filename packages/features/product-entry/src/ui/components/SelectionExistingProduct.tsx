'use client';
import type { Dto } from '@dukani/contracts';
import { ListRow, Section } from '@dukani/ui-kit';
import { useEntryTranslations } from '../i18n/use-entry-translations';

/** «در فروشگاه شما» when the item is already in the store: the stock goes to that product, its name stays as it is. */
export function SelectionExistingProduct({ product }: { product: Dto<'StoreProductDto'> | undefined }) {
  const t = useEntryTranslations();
  return (
    <Section title={t('inStore')} className="desktop:p-6">
      <p>{t('existingHint')}</p>
      <ListRow>{product?.title}</ListRow>
      <ListRow>{product?.localNote}</ListRow>
    </Section>
  );
}
