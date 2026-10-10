'use client';
import type { CatalogType } from '../../domain/catalog.types';
import { useAppMutation } from '@dukani/data';
import { useCatalogModule } from '../../module';
import { useState } from 'react';
import { useActiveStore, useCan, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import {
  Badge,
  Button,
  ProductDataRow,
  RecordList,
  Section,
  Alert,
  useAppErrorMessage,
} from '@dukani/ui-kit';
import type { CatalogStatus } from '../../domain/catalog.types';
import { useCatalogQuery } from '../hooks/use-catalog-query';
import { CatalogShell } from '../components/CatalogShell';
import { CatalogQueryState } from '../components/CatalogQueryState';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
const STATUS_TONE: Record<CatalogStatus, 'neutral' | 'warning' | 'success'> = {
  Private: 'neutral',
  PendingReview: 'warning',
  Public: 'success',
  Archived: 'neutral',
};
export function ProductTypeScreen({
  productTypeId,
  onCreate,
}: {
  productTypeId: string;
  onCreate: (type: CatalogType) => Promise<void>;
}) {
  const t = useCatalogTexts();
  const store = useActiveStore();
  const can = useCan('product.manage');
  const nav = useNavigation();
  const { catalog } = useCatalogModule();
  const message = useAppErrorMessage();
  const review = useAppMutation({
    mutationFn: () => catalog.submitType(store.id, productTypeId),
    invalidates: [['catalog', store.id]],
  });
  const type = useCatalogQuery(['type', productTypeId], (port, id, signal) =>
    port.type(id, productTypeId, signal),
  );
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(false);
  const create = async () => {
    if (!type.data || type.error || starting || type.data.status === 'Archived') return;
    setStarting(true);
    setStartError(false);
    try {
      await onCreate(type.data);
    } catch {
      setStartError(true);
    } finally {
      setStarting(false);
    }
  };
  return (
    <CatalogShell
      title={t('typeTitle', { name: type.data?.name ?? '' })}
      actions={
        can ? (
          <Button
            block
            onClick={() => {
              void create();
            }}
            loading={starting}
            disabled={!type.data || !!type.error || type.data.status === 'Archived'}
          >
            {t('createOfType')}
          </Button>
        ) : undefined
      }
    >
      {review.error ? <Alert tone="danger" title={message(review.error)} /> : null}
      <CatalogQueryState
        pending={type.isPending}
        error={type.error}
        retry={() => {
          void type.refetch();
        }}
      />
      {startError ? <Alert tone="danger" title={t('startFailed')} /> : null}
      {type.data && !type.error ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-body-m text-fg-secondary">
              {t('groupLabel', { name: type.data.categoryName ?? t('noCategory') })}
            </p>
            <Badge tone={STATUS_TONE[type.data.status]} appearance="outline">
              {t(`status.${type.data.status}`)}
            </Badge>
          </div>
          {can && type.data.status === 'Private' ? (
            <Button variant="secondary" loading={review.isPending} onClick={() => review.mutate(undefined)}>
              {t('review')}
            </Button>
          ) : null}
          <div className="desktop:grid desktop:grid-cols-3 desktop:gap-6 flex flex-col gap-3">
            <div className="desktop:col-span-2 flex flex-col gap-3">
              <RecordList
                label={t('attributes')}
                columns={[t('attribute'), t('valueType'), t('requirement')]}
                rows={type.data.attributes.map((attribute) => ({
                  id: attribute.attributeId,
                  card: (
                    <ProductDataRow
                      title={attribute.name}
                      subtitle={t(`dataType.${attribute.dataType}`)}
                      meta={t(attribute.isRequired ? 'required' : 'optional')}
                      metaTone="warning"
                    />
                  ),
                  cells: [
                    attribute.name,
                    t(`dataType.${attribute.dataType}`),
                    t(attribute.isRequired ? 'required' : 'optional'),
                  ],
                }))}
              />
              <Button
                variant="secondary"
                block
                onClick={() => nav.push(sellerRoutes.catalog.list(store.id, productTypeId))}
              >
                {t('itemsOfType')}
              </Button>
            </div>
            <Section title={t('defaultUnit')} className="bg-brand-subtle desktop:bg-surface">
              <p className="text-body-m text-fg-secondary">
                {t('newCatalogHint', { name: type.data.defaultBaseUnit.name })}
              </p>
            </Section>
          </div>
        </>
      ) : null}
    </CatalogShell>
  );
}
