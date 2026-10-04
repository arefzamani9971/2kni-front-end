'use client';
import { useCan } from '@dukani/platform';
import { Badge, Button, ButtonLink, PageShell, PageState } from '@dukani/ui-kit';
import { storeInfoView } from '../../domain/store-profile';
import { useStore } from '../hooks/use-store';
import type { StoreInfoScreenProps } from './StoreInfoScreen.types';

/**
 * STORE-04 «اطلاعات و تنظیمات» (Figma 385:6853): the store card, the edit entry (STORE-05) and the details with
 * the two sub-pages (storeprofile 358:481, storelegal 358:482). Only real values are shown — an empty field is
 * left out, never a Figma sample. The «روش‌های فروش / پرداخت» cards of the frame are release 3.0 (sales channels
 * and the payment axis) and have no 1.0 data, so they are not rendered. Editing needs `store.settings`.
 */
export function StoreInfoScreen({ storeId, editHref, contactHref, privateHref }: StoreInfoScreenProps) {
  const query = useStore(storeId);
  const canEdit = useCan('store.settings');
  const store = query.data?.profile;

  if (!store)
    return (
      <PageShell title="اطلاعات و تنظیمات" header={null}>
        {query.error ? (
          <PageState
            kind="error"
            description={query.error.message}
            action={<Button onClick={() => void query.refetch()}>تلاش دوباره</Button>}
          />
        ) : (
          <PageState kind="loading" rows={4} />
        )}
      </PageShell>
    );

  const v = storeInfoView(store);
  return (
    <PageShell title="اطلاعات و تنظیمات" header={null} contentClassName="gap-3">
      <p className="text-caption text-fg-brand font-medium">فروشگاه</p>
      <h1 className="text-heading-xl text-fg-primary">اطلاعات و تنظیمات</h1>

      <section aria-label="فروشگاه" className="border-line bg-surface flex flex-col gap-2 rounded-lg border p-4">
        <h2 className="text-label-m text-fg-primary font-semibold">{v.name}</h2>
        <div className="flex items-center justify-between gap-2">
          <p className="text-label-s text-fg-primary">نوع: {v.typeName}</p>
          <Badge tone="success" size="sm">
            فعال
          </Badge>
        </div>
        {v.address ? <p className="text-body-s text-fg-secondary">{v.address}</p> : null}
      </section>

      {canEdit ? <ButtonLink href={editHref}>ویرایش اطلاعات و تنظیمات</ButtonLink> : null}

      <section aria-label="جزئیات فروشگاه" className="bg-surface flex flex-col gap-3 rounded-md p-4">
        {v.businessMode ? <h2 className="text-heading-m text-fg-primary">{v.businessMode}</h2> : null}
        {v.contact ? <p className="text-body-m text-fg-secondary">{v.contact}</p> : null}
        {v.postalAndHours ? <p className="text-body-m text-fg-secondary">{v.postalAndHours}</p> : null}
        {canEdit ? (
          <>
            <ButtonLink href={contactHref}>تماس، نشانی و تصویر</ButtonLink>
            <ButtonLink href={privateHref}>اطلاعات خصوصی مالک و تسویه</ButtonLink>
          </>
        ) : null}
      </section>
    </PageShell>
  );
}
