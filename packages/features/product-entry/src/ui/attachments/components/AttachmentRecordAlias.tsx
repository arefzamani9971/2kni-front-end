'use client';
import { BarcodeField, ButtonLink } from '@dukani/ui-kit';
import { useActiveStore } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { useAttachmentTranslations } from '../../i18n/use-attachment-translations';
import type { AttachmentRecordAliasProps } from '../types/AttachmentRecordAlias.types';

export function AttachmentRecordAlias({ item, value, disabled, onChange }: AttachmentRecordAliasProps) {
  const t = useAttachmentTranslations();
  const store = useActiveStore();

  if (item.myStoreProductId) {
    return (
      <ButtonLink href={sellerRoutes.products.barcodeAlias(store.id, item.myStoreProductId)}>
        {t('alias')}
      </ButtonLink>
    );
  }

  return (
    <BarcodeField
      label={t('local')}
      placeholder={t('barcodePlaceholder')}
      classNames={{ label: 'desktop:sr-only' }}
      optional
      disabled={disabled}
      value={value}
      onChange={(localBarcode) => onChange(item.id, { localBarcode })}
      maxLength={32}
    />
  );
}
