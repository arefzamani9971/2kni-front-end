'use client';
import { useEntryTranslations } from '../i18n/use-entry-translations';

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
  const t = useEntryTranslations();

  const store = useActiveStore();
  const go = useEntryNav();
  const { startNew } = useStartEntry();
  const [q, setQ] = useState('');
  const [starting, setStarting] = useState(false);
  const services = useIsReleased('1.0', 'service-items');
  const search = () => q.trim() && go.search(q.trim());

  return (
    <EntryShell title={t('addProduct')} actions={<BackButton onClick={go.home} />}>
      <Section title={t('findCatalog')} description={t('findCatalogHint')}>
        <form
          role="search"
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
        >
          <SearchField
            label={t('nameBarcodeSearch')}
            value={q}
            onChange={setQ}
            placeholder={t('searchExample')}
          />
          <Button type="submit" variant="secondary" block disabled={!q.trim()}>
            {t('search')}
          </Button>
        </form>
      </Section>
      <Section title={t('otherMethods')}>
        <ButtonLink href={sellerRoutes.entry.barcode(store.id)}>{t('scanBarcode')}</ButtonLink>
        <Button
          variant="secondary"
          block
          loading={starting}
          onClick={async () => {
            setStarting(true);
            await startNew().finally(() => setStarting(false));
          }}
        >
          {t('newProduct')}
        </Button>
        {services ? (
          <ButtonLink href={sellerRoutes.entry.service(store.id)}>{t('addService')}</ButtonLink>
        ) : null}
      </Section>
      <ButtonLink href={`/s/${store.id}/entry/bulk`}>{t('bulkEntry')}</ButtonLink>
      <ButtonLink href={`/s/${store.id}/import`}>{t('importExcel')}</ButtonLink>
    </EntryShell>
  );
}
