'use client';
import { Button, FlowShell, NavCard, PageState } from '@dukani/ui-kit';
import { ROLE_LABELS, type Invitation } from '../../domain/store';
import { useMyStores } from '../hooks/use-my-stores';

export type StoresScreenProps = {
  readonly storeHref: (storeId: string) => string;
  readonly onCreate: () => void;
  readonly onBack?: () => void;
  /** Invitation review (staff-access feature); invitations are hidden until it is provided. */
  readonly onInvitation?: (invitation: Invitation) => void;
};

/** storeselect (Figma 358:480): the seller's stores and pending invitations. */
export function StoresScreen({ storeHref, onCreate, onBack, onInvitation }: StoresScreenProps) {
  const my = useMyStores();
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
      {my.data && my.data.stores.length === 0 && (!onInvitation || my.data.invitations.length === 0) ? (
        <PageState kind="empty" title="هنوز فروشگاهی ندارید" description="برای شروع، نام و نوع فروشگاه را ثبت کنید." />
      ) : null}
      {my.data?.stores.map((s) => (
        <NavCard
          key={s.id}
          href={storeHref(s.id)}
          title={s.name}
          meta={`${ROLE_LABELS[s.role]} · ${s.isDefault ? 'فروشگاه پیش‌فرض' : s.typeName}`}
          cta="ورود به پنل"
        />
      ))}
      {onInvitation
        ? my.data?.invitations.map((i) => (
            <NavCard key={i.id} onClick={() => onInvitation(i)} title={i.storeName} meta="دعوت به همکاری" cta="مشاهده دعوت" />
          ))
        : null}
    </FlowShell>
  );
}
