'use client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { cn } from '../lib/cn';
import { Button } from '../primitives/Button';
import type { FileUploadFieldProps } from './FileUploadField.types';
import { FileUploadItem } from './FileUploadItem';
import { addFiles, removeFile } from './file-selection';
import type { FileSelectionError } from './file-selection.types';

/** File/image picker with previews, limits and per-file states. Uploading is done by the feature. */
export function FileUploadField({
  label,
  value,
  onChange,
  accept,
  maxFiles = 1,
  maxSizeMb = 10,
  images,
  className,
  ...props
}: FileUploadFieldProps) {
  const t = useUiTranslations();

  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<FileSelectionError | null>(null);
  const urls = useMemo(
    () => new Map(value.map((f) => [f.id, images ? URL.createObjectURL(f.file) : ''])),
    [value, images],
  );
  useEffect(() => () => urls.forEach((u) => u && URL.revokeObjectURL(u)), [urls]);

  const add = (list: FileList | null) => {
    if (!list) return;
    const picked = addFiles(value, Array.from(list), { accept, maxFiles, maxSizeMb, images });
    if (picked.error) setError(picked.error);
    onChange(picked.next);
  };

  const remove = (fid: string) => {
    setError(null);
    onChange(removeFile(value, fid, images));
  };

  const message = error
    ? error === 'type'
      ? t('controls.invalidFileType')
      : error === 'size'
        ? t('upload.maxSize', { size: maxSizeMb })
        : t('upload.maxFiles', { count: maxFiles })
    : props.message;
  const status = error ? 'error' : props.status;
  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <label htmlFor={id} className="text-label-s text-fg-primary">
        {label}
        {props.optional ? <span className="text-fg-secondary"> {t('controls.optional')}</span> : null}
      </label>
      {value.length ? (
        <ul className={cn(images ? 'grid grid-cols-3 gap-2' : 'flex flex-col gap-2')}>
          {value.map((f) => (
            <FileUploadItem
              key={f.id}
              file={f}
              images={images}
              url={urls.get(f.id)}
              state={props.fileState?.(f.id)}
              onPrimary={() => onChange(value.map((x) => ({ ...x, primary: x.id === f.id })))}
              onRemove={() => remove(f.id)}
            />
          ))}
        </ul>
      ) : null}
      {value.length < maxFiles ? (
        <Button
          variant="secondary"
          iconStart={images ? 'image' : 'upload'}
          onClick={() => input.current?.click()}
        >
          {images ? t('controls.addImage') : t('controls.chooseFile')}
        </Button>
      ) : null}
      <input
        ref={input}
        id={id}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        className="sr-only"
        onChange={(e) => {
          add(e.target.files);
          e.target.value = '';
        }}
      />
      {message ? (
        <p
          aria-live="polite"
          className={cn('text-caption', status === 'error' ? 'text-danger' : 'text-fg-secondary')}
        >
          {message}
        </p>
      ) : props.hint ? (
        <p className="text-caption text-fg-secondary">{props.hint}</p>
      ) : null}
    </div>
  );
}
