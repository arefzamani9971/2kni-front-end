'use client';
import { useUiTranslations } from '../i18n/use-ui-translations';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { Button } from '../primitives/Button';
import { IMAGE_ACCEPT } from './UploadArea.constants';
import type { UploadAreaProps } from './UploadArea.types';

const accepts = (accept: string, file: File) => accept.split(',').some((a) => a.trim() === file.type);

/**
 * Figma «Dukani/Upload Area» (593:231): a surface card with title and body that opens the file picker.
 * One image; type and size are checked here, the upload itself belongs to the owner feature.
 */
export function UploadArea({
  title,
  description,
  value,
  onChange,
  currentUrl,
  accept = IMAGE_ACCEPT,
  maxSizeMb = 10,
  message,
  disabled,
  className,
}: UploadAreaProps) {
  const t = useUiTranslations();

  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<'type' | 'empty' | 'size' | null>(null);
  const preview = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);
  const shown = preview ?? currentUrl ?? null;

  const pick = (file: File | undefined) => {
    if (!file) return;
    if (!accepts(accept, file)) return setError('type');
    if (file.size === 0) return setError('empty');
    if (file.size > maxSizeMb * 1024 * 1024) return setError('size');
    setError(null);
    onChange(file);
  };

  const shownMessage = error
    ? error === 'type'
      ? t('upload.imageType')
      : error === 'empty'
        ? t('upload.empty')
        : t('upload.maxSize', { size: maxSizeMb })
    : message;
  return (
    <div
      className={cn(
        'border-line bg-surface flex w-full flex-col gap-3 rounded-md border p-4 text-start',
        shownMessage && 'border-danger',
        className,
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => input.current?.click()}
        aria-describedby={shownMessage ? `${id}-msg` : undefined}
        className="focus-visible:outline-focus flex w-full items-center gap-3 rounded-sm text-start focus-visible:outline-2 disabled:opacity-60"
      >
        {shown ? (
          <img src={shown} alt="" className="border-line size-14 shrink-0 rounded-md border object-cover" />
        ) : null}
        <span className="flex min-w-0 flex-1 flex-col gap-3">
          <span className="text-heading-m text-fg-primary">{title}</span>
          {description ? (
            <span className="text-body-m text-fg-secondary truncate" dir={value ? 'auto' : undefined}>
              {value ? value.name : description}
            </span>
          ) : null}
        </span>
      </button>
      {value || currentUrl ? (
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={disabled}
            onClick={() => input.current?.click()}
          >
            {t('controls.changeImage')}
          </Button>
          {value ? (
            <Button type="button" size="sm" variant="text" disabled={disabled} onClick={() => onChange(null)}>
              {t('controls.remove')}
            </Button>
          ) : null}
        </div>
      ) : null}
      {shownMessage ? (
        <p id={`${id}-msg`} role="alert" className="text-body-s text-danger">
          {shownMessage}
        </p>
      ) : null}
      <input
        ref={input}
        type="file"
        accept={accept}
        hidden
        aria-label={typeof title === 'string' ? title : t('controls.chooseImage')}
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
