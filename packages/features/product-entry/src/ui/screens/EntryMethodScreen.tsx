'use client';
import { useActiveStore, useIsReleased } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Button, ButtonLink, SearchField, Section } from '@dukani/ui-kit';
import { useState } from 'react';
import { BackButton } from '../components/BackButton';
import { EntryShell } from '../components/EntryShell';
import { useEntryNav } from '../hooks/use-entry-nav';
import { useStartEntry } from '../hooks/use-start-entry';

/** method (Figma 312:8778): search the store/catalog first, other ways below (F14). */
export function EntryMethodScreen() {
  const store = useActiveStore();
  const go = useEntryNav();
  const { startNew } = useStartEntry();
  const [q, setQ] = useState('');
  const [starting, setStarting] = useState(false);
  const services = useIsReleased('1.0', 'service-items');
  const search = () => q.trim() && go.search(q.trim());

  return (
    <EntryShell title="افزودن کالا" actions={<BackButton onClick={go.home} />}>
      <Section title="از کاتالوگ پیدا کنید" description="کالای موجود در فروشگاه یا کاتالوگ را انتخاب کنید.">
        <form
          role="search"
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
        >
          <SearchField label="جست‌وجوی نام یا بارکد" value={q} onChange={setQ} placeholder="مثلاً خودکار بیک آبی" />
          <Button type="submit" variant="secondary" block disabled={!q.trim()}>
            جست‌وجو
          </Button>
        </form>
      </Section>
      <Section title="روش‌های دیگر">
        <ButtonLink href={sellerRoutes.entry.barcode(store.id)}>اسکن بارکد</ButtonLink>
        <Button
          variant="secondary"
          block
          loading={starting}
          onClick={async () => {
            setStarting(true);
            await startNew().finally(() => setStarting(false));
          }}
        >
          ثبت کالای جدید
        </Button>
        {services ? <ButtonLink href={sellerRoutes.entry.service(store.id)}>ثبت خدمت (بدون موجودی)</ButtonLink> : null}
      </Section>
      <ButtonLink href={`/s/${store.id}/entry/bulk`}>ثبت چند کالا</ButtonLink>
      <ButtonLink href={`/s/${store.id}/import`}>ورود از Excel</ButtonLink>
    </EntryShell>
  );
}
