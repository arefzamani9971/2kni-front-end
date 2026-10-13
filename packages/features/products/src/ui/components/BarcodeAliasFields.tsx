import type { Ref } from 'react';
import type { AppError } from '@dukani/domain';
import type { BarcodeAliasPreview } from '../../domain/barcode-alias.types';
import { Alert, Button, SelectField, TextField, useAppErrorMessage } from '@dukani/ui-kit';
import { useProductTranslations } from '../i18n/use-product-translations';
import type { BarcodeAliasUnit } from './BarcodeAliasFields.types';

export function BarcodeAliasFields({
  units,
  unit,
  barcode,
  preview,
  failure,
  busy,
  inputRef,
  onUnitChange,
  onBarcodeChange,
  onRefresh,
}: {
  units: readonly BarcodeAliasUnit[];
  unit?: BarcodeAliasUnit;
  barcode: string;
  preview?: BarcodeAliasPreview;
  failure?: AppError;
  busy: boolean;
  inputRef: Ref<HTMLInputElement>;
  onUnitChange: (value: string) => void;
  onBarcodeChange: (value: string) => void;
  onRefresh: () => void;
}) {
  const t = useProductTranslations();
  const message = useAppErrorMessage();
  const conflict = failure?.code === 'BARCODE_DUPLICATE';
  return (
    <>
      {units.length > 1 ? (
        <SelectField
          label={t('alias.unit')}
          value={unit?.id}
          options={units.map((u) => ({ value: u.id, label: u.name }))}
          disabled={busy || !!preview}
          onChange={(value) => {
            onUnitChange(value);
          }}
        />
      ) : null}
      <div className="desktop:grid-cols-2 grid gap-3">
        {!conflict ? (
          <TextField
            label={t('alias.existing')}
            value={(preview?.existingBarcodes ?? unit?.barcodes ?? []).join('، ')}
            readOnly
            dir="ltr"
          />
        ) : null}
        <TextField
          ref={inputRef}
          label={t('alias.new')}
          value={preview?.barcode ?? barcode}
          onChange={(value) => {
            onBarcodeChange(value);
          }}
          disabled={busy}
          readOnly={!!preview}
          dir="ltr"
          asciiDigits
          maxLength={32}
          autoComplete="off"
          status={failure ? 'error' : 'default'}
          message={failure ? message(failure) : undefined}
        />
      </div>
      {conflict ? <Alert tone="info" title={t('alias.preserved')} /> : null}
      {preview ? (
        <Alert
          tone="info"
          title={preview.alreadyExists ? t('alias.exists') : t('alias.confirmHint')}
          description={
            <bdi>
              {[...preview.existingBarcodes, ...(preview.alreadyExists ? [] : [preview.barcode])].join('، ')}
            </bdi>
          }
        />
      ) : null}
      {failure?.code === 'VERSION_CONFLICT' ? (
        <Button
          variant="secondary"
          onClick={() => {
            onRefresh();
          }}
        >
          {t('alias.refresh')}
        </Button>
      ) : null}
    </>
  );
}
