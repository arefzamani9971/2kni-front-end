'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cropImage, type CropRect } from '@dukani/platform';
import { Alert, Button, DecimalField, TextField } from '@dukani/ui-kit';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import { IMAGE_CROP_FIELDS, INITIAL_CROP_RECT } from '../constants/ImageEditor.constants';
export function ImageEditor({
  file,
  onApply,
  onCancel,
}: {
  file: File;
  onApply: (file: File) => void;
  onCancel: () => void;
}) {
  const t = useEntryTranslations();
  // The mounted image owns its URL; ref cleanup also handles StrictMode replay and file replacement.
  const previewRef = useCallback(
    (image: HTMLImageElement | null) => {
      if (!image) return;
      const url = URL.createObjectURL(file);
      image.src = url;
      return () => {
        image.removeAttribute('src');
        URL.revokeObjectURL(url);
      };
    },
    [file],
  );
  const [rect, setRect] = useState<CropRect>(INITIAL_CROP_RECT);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const apply = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const cropped = await cropImage(file, rect);
      if (mounted.current) onApply(cropped);
    } catch {
      if (mounted.current) setFailed(true);
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="desktop:grid-cols-3 grid gap-4">
        <div className="desktop:col-span-2 bg-muted relative rounded-lg p-4">
          <img ref={previewRef} alt={t('images.preview')} className="max-h-80 w-full object-contain" />
        </div>
        <div className="flex flex-col gap-3">
          <TextField disabled label={t('images.title')} value="" hint={t('images.metadataGap')} />
          <TextField disabled label={t('images.usage')} value={t('images.private')} />
          {IMAGE_CROP_FIELDS.map((key) => (
            <DecimalField
              key={key}
              label={t(`images.${key}`)}
              value={String(rect[key])}
              disabled={busy}
              maxDecimals={0}
              onChange={(value) =>
                setRect((current) => ({ ...current, [key]: value === '' ? NaN : Number(value) }))
              }
            />
          ))}
        </div>
      </div>
      {failed ? <Alert tone="danger" title={t('images.cropFailed')} /> : null}
      <Button loading={busy} disabled={busy} onClick={() => void apply()}>
        {t('images.crop')}
      </Button>
      <Button variant="secondary" disabled={busy} onClick={onCancel}>
        {t('back')}
      </Button>
    </div>
  );
}
