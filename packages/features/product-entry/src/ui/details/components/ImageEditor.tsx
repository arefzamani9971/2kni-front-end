'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cropImage, type CropRect } from '@dukani/platform';
import { Alert, Button, DecimalField, TextField } from '@dukani/ui-kit';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
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
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  const [rect, setRect] = useState<CropRect>({ left: 0, top: 0, width: 100, height: 100 });
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
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
          {url ? (
            <img src={url} alt={t('images.preview')} className="max-h-80 w-full object-contain" />
          ) : null}
        </div>
        <div className="flex flex-col gap-3">
          <TextField disabled label={t('images.title')} value="" hint={t('images.metadataGap')} />
          <TextField disabled label={t('images.usage')} value={t('images.private')} />
          {(['left', 'top', 'width', 'height'] as const).map((key) => (
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
