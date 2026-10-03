'use client';
import { formatJalali, toPersianDigits } from '@dukani/domain';
import { Button, FlowShell, NavCard, PageState, Section } from '@dukani/ui-kit';
import { ROLE_LABELS } from '../../domain/store.constants';
import { useMyStores } from '../hooks/use-my-stores';
import type { StoresScreenProps } from './StoresScreen.types';

const until = (iso: string) => `تا ${toPersianDigits(formatJalali(new Date(iso)))}`;

/**
 * storeselect «فروشگاه‌های من» (Figma 358:480; desktop 358:5343 with the side card). The four collections
 * of `GET /stores` keep their own meaning (F02 §4, AC05): only active memberships enter the panel; a pending
 * invitation or ownership transfer is not a membership; a deactivated store has no normal entry. Rows are
 * keyed by id — two stores with the same name are fine.
 */
export function StoresScreen({
  storeHref,
  onCreate,
  onBack,
  onInvitation,
  onOwnershipTransfer,
  onReactivate,
}: StoresScreenProps) {
  const my = useMyStores();
  const data = my.data;
  const empty =
    data &&
    !data.stores.length &&
    !data.invitations.length &&
    !data.ownershipTransfers.length &&
    !data.deactivatedStores.length;
  const defaultStore = data?.stores.find((s) => s.isDefault) ?? data?.stores[0];

  return (
    <FlowShell
      appBar={{ title: 'فروشگاه‌های من', back: onBack }}
      actions={
        <Button block onClick={onCreate}>
          ثبت فروشگاه
        </Button>
      }
    >
      {my.isPending ? <PageState kind="loading" rows={2} /> : null}
      {my.error ? (
        <PageState
          kind="error"
          description={my.error.message}
          action={
            <Button variant="secondary" onClick={() => void my.refetch()}>
              تلاش دوباره
            </Button>
          }
        />
      ) : null}
      {empty ? (
        <PageState kind="empty" title="هنوز فروشگاهی ندارید" description="برای شروع، نام و نوع فروشگاه را ثبت کنید." />
      ) : null}
      {data && !empty ? (
        <div className="desktop:grid desktop:grid-cols-[minmax(0,1fr)_340px] desktop:items-start desktop:gap-4 flex flex-col gap-3">
          <ul className="flex flex-col gap-3">
            {data.stores.map((s) => (
              <li key={s.id}>
                <NavCard
                  href={storeHref(s.id)}
                  title={s.name}
                  meta={`${ROLE_LABELS[s.role]} · ${s.isDefault ? 'فروشگاه پیش‌فرض' : s.typeName}`}
                  cta="ورود به پنل"
                />
              </li>
            ))}
            {data.invitations.map((i) => (
              <li key={i.id}>
                <NavCard
                  onClick={onInvitation ? () => onInvitation(i) : undefined}
                  title={i.storeName}
                  meta={`دعوت به همکاری${i.invitedBy ? ` از ${i.invitedBy}` : ''} · ${until(i.expiresAt)}`}
                  cta={onInvitation ? 'مشاهده دعوت' : undefined}
                />
              </li>
            ))}
            {data.ownershipTransfers.map((t) => (
              <li key={t.id}>
                <NavCard
                  onClick={onOwnershipTransfer ? () => onOwnershipTransfer(t) : undefined}
                  title={t.storeName}
                  meta={`انتقال مالکیت به شما در انتظار تأیید · ${until(t.expiresAt)}`}
                  cta={onOwnershipTransfer ? 'بررسی انتقال' : undefined}
                />
              </li>
            ))}
            {data.deactivatedStores.map((d) => (
              <li key={d.storeId}>
                <NavCard
                  onClick={onReactivate && d.canReactivate ? () => onReactivate(d) : undefined}
                  title={d.storeName}
                  meta={d.canReactivate ? 'فروشگاه غیرفعال' : 'فروشگاه غیرفعال · با پشتیبانی تماس بگیرید'}
                  cta={onReactivate && d.canReactivate ? 'فعال‌سازی دوباره' : undefined}
                />
              </li>
            ))}
          </ul>
          <Section title="فروشگاه‌های من" className="desktop:flex hidden">
            {defaultStore ? <p className="text-body-m text-fg-secondary">{defaultStore.name}</p> : null}
            <Button onClick={onCreate} className="self-start">
              ثبت فروشگاه
            </Button>
          </Section>
        </div>
      ) : null}
    </FlowShell>
  );
}
