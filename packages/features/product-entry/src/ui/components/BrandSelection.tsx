'use client';
import { useState } from 'react';
import type { Dto } from '@dukani/contracts';
import type { AppError } from '@dukani/domain';
import { normalizeTitle } from '@dukani/domain';
import {
  Alert,
  Button,
  ChoiceScene,
  PageState,
  SearchField,
  Section,
  useAppErrorMessage,
} from '@dukani/ui-kit';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import { BRAND_NONE, BRAND_UNKNOWN } from './NewItemDetails.constants';
export function BrandSelection({
  value,
  brands,
  pending,
  error,
  retry,
  onSelect,
  onCreate,
  onCancel,
}: {
  value: string;
  brands: readonly Dto<'BrandDto'>[];
  pending: boolean;
  error: AppError | null;
  retry: () => void;
  onSelect: (value: string) => void;
  onCreate?: (name: string) => void;
  onCancel: () => void;
}) {
  const t = useEntryTranslations();
  const message = useAppErrorMessage();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(value);
  // same ی/ک, digit and spacing normalization as the server, so «كاغذ» finds «کاغذ»
  const needle = normalizeTitle(query);
  const latin = query.trim().toLowerCase();
  const active = brands.filter((brand) => brand.status !== 'Archived');
  const visible = active.filter(
    (brand) => normalizeTitle(brand.name).includes(needle) || !!brand.nameEn?.toLowerCase().includes(latin),
  );
  // creating a brand whose normalized name already exists would only end in a duplicate conflict
  const exact = needle ? active.find((brand) => normalizeTitle(brand.name) === needle) : undefined;
  const brand = brands.find((row) => row.id === selected);
  return (
    <ChoiceScene
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      title={t('selectBrand')}
      primaryAction={
        <Button block disabled={!brand || pending || !!error} onClick={() => onSelect(selected)}>
          {brand?.name ?? t('selectBrand')}
        </Button>
      }
      secondaryAction={
        onCreate ? (
          <Button
            block
            variant="secondary"
            onClick={() => (exact ? setSelected(exact.id) : onCreate(query.trim()))}
          >
            {exact ? t('selectExistingBrand', { name: exact.name }) : t('createBrand')}
          </Button>
        ) : undefined
      }
      alternatives={[
        { id: BRAND_NONE, label: t('unbranded'), marker: 'tag', onSelect: () => onSelect(BRAND_NONE) },
        {
          id: BRAND_UNKNOWN,
          label: t('unknownBrand'),
          marker: 'warning',
          onSelect: () => onSelect(BRAND_UNKNOWN),
        },
      ]}
    >
      <Section
        title={<span className="desktop:hidden">{t('selectBrand')}</span>}
        description={t('selectBrandHint')}
        className="border-0 bg-transparent p-0"
      >
        <SearchField label={t('brand')} value={query} onChange={setQuery} />
        {pending ? (
          <PageState kind="loading" />
        ) : error ? (
          <Alert
            tone="danger"
            title={message(error)}
            action={
              <Button variant="secondary" onClick={retry}>
                {t('retry')}
              </Button>
            }
          />
        ) : visible.length ? (
          <div className="flex flex-col gap-1" role="group" aria-label={t('brand')}>
            {visible.map((row) => (
              <Button
                key={row.id}
                variant="secondary"
                aria-pressed={selected === row.id}
                onClick={() => setSelected(row.id)}
              >
                {row.name}
              </Button>
            ))}
          </div>
        ) : (
          <PageState kind="empty" title={t('noBrandResults')} />
        )}
      </Section>
    </ChoiceScene>
  );
}
