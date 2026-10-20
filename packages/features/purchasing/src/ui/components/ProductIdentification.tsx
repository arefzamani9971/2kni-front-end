'use client';
import { useActiveStore, useCan } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { BarcodeField, Button, ButtonLink, ScanArea, Section } from '@dukani/ui-kit';
import { useState } from 'react';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';
import { useProductIdentification } from '../hooks/use-product-identification';
import { ProductAutocomplete } from './ProductAutocomplete';
import type { IdentificationNote } from './ProductIdentification.types';

/**
 * Finding the product of a purchase (CPB-06, CPB-18): manual barcode, scanner or camera through the one scan area,
 * or the name search. Every way only identifies the product (and the scanned unit); switching ways keeps the form.
 * A code no product of this store has offers «ثبت سریع کالای جدید», which returns here (US-F10-01).
 */
export function ProductIdentification({
  onIdentify,
  disabled,
}: {
  onIdentify: (productId: string, unitId: string | null) => void;
  disabled?: boolean;
}) {
  const t = usePurchaseTranslations();
  const store = useActiveStore();
  const canCreate = useCan('product.manage');
  const [code, setCode] = useState('');
  const [note, setNote] = useState<IdentificationNote>(null);
  const intake = useProductIdentification({
    enabled: !disabled,
    onProduct: (productId, unitId) => {
      setNote(null);
      setCode('');
      onIdentify(productId, unitId);
    },
    onMissing: (missing) => setNote({ kind: 'missing', code: missing }),
    onAmbiguous: (ambiguous) => setNote({ kind: 'ambiguous', code: ambiguous }),
  });
  const message =
    note?.kind === 'missing'
      ? t('receipt.missingProduct', { code: note.code })
      : note?.kind === 'ambiguous'
        ? t('receipt.ambiguousBarcode', { code: note.code })
        : undefined;
  return (
    <Section title={t('receipt.identifyTitle')}>
      <ScanArea
        status={intake.status}
        message={message}
        size="compact"
        camera={disabled ? undefined : intake.camera}
        manual={
          <BarcodeField
            label={t('receipt.manualBarcode')}
            value={code}
            onChange={setCode}
            disabled={disabled}
            inputProps={{
              onKeyDown: (event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  intake.submit(code);
                }
              },
            }}
          />
        }
      />
      <Button
        type="button"
        variant="secondary"
        disabled={disabled || !code.trim()}
        onClick={() => intake.submit(code)}
      >
        {t('receipt.chooseByBarcode')}
      </Button>
      <ProductAutocomplete disabled={disabled} onSelect={(row) => onIdentify(row.id, null)} />
      {canCreate ? (
        <ButtonLink
          variant={note?.kind === 'missing' ? 'secondary' : 'text'}
          href={sellerRoutes.entry.new(
            store.id,
            undefined,
            'continuous',
            note?.kind === 'missing' ? note.code : undefined,
          )}
        >
          {t('receipt.createMissing')}
        </ButtonLink>
      ) : null}
    </Section>
  );
}
