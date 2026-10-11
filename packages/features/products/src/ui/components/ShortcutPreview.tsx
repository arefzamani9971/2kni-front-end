'use client';
import { Section } from '@dukani/ui-kit';
import type { ShortcutItem } from '../../domain/shortcut.types';
import { useProductTranslations } from '../i18n/use-product-translations';

/** What the sale screen quick-pick strip will show: visible and eligible shortcuts, in order. */
export function ShortcutPreview({ items }: { items: readonly ShortcutItem[] }) {
  const t = useProductTranslations();
  return (
    <Section title={t('shortcuts.preview')}>
      <div className="desktop:grid-cols-5 grid grid-cols-2 gap-3">
        {items
          .filter((i) => i.showInQuickPick && i.isEligible)
          .map((item) => (
            <div className="border-line rounded-lg border p-4" key={item.storeProductId}>
              <bdi className="text-fg-brand">{item.code}</bdi>
              <p className="text-body-m">{item.title}</p>
            </div>
          ))}
      </div>
    </Section>
  );
}
