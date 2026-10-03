'use client';
import { toPersianDigits } from '@dukani/domain';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';

import { Button } from '../primitives/Button';
import { IconButton } from '../primitives/IconButton';
import type { FileUploadFieldProps } from './FileUploadField.types';

const ACCEPT_MATCH = (accept: string, file: File) =>
  accept.split(',').some((a) => {
    const t = a.trim();
    return t.endsWith('/*') ? file.type.startsWith(t.slice(0, -1)) : file.type === t;
  });

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
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const urls = useMemo(
    () => new Map(value.map((f) => [f.id, images ? URL.createObjectURL(f.file) : ''])),
    [value, images],
  );
  useEffect(() => () => urls.forEach((u) => u && URL.revokeObjectURL(u)), [urls]);

  const add = (list: FileList | null) => {
    if (!list) return;
    const next = [...value];
    for (const file of Array.from(list)) {
      if (next.length >= maxFiles) {
        setError(`حداکثر ${toPersianDigits(maxFiles)} فایل.`);
        break;
      }
      if (!ACCEPT_MATCH(accept, file)) {
        setError('نوع فایل مجاز نیست.');
        continue;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`حجم هر فایل حداکثر ${toPersianDigits(maxSizeMb)} مگابایت است.`);
        continue;
      }
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        primary: images && next.length === 0,
      });
    }
    onChange(next);
  };

  const remove = (fid: string) => {
    const next = value.filter((f) => f.id !== fid);
    if (images && next.length && !next.some((f) => f.primary)) next[0] = { ...next[0]!, primary: true };
    setError(null);
    onChange(next);
  };

  const message = error ?? props.message;
  const status = error ? 'error' : props.status;
  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <label htmlFor={id} className="text-label-s text-fg-primary">
        {label}
        {props.optional ? <span className="text-fg-secondary"> (اختیاری)</span> : null}
      </label>
      {value.length ? (
        <ul className={cn(images ? 'grid grid-cols-3 gap-2' : 'flex flex-col gap-2')}>
          {value.map((f) => {
            const st = props.fileState?.(f.id);
            return (
              <li
                key={f.id}
                className={cn(
                  'border-line bg-surface relative rounded-md border',
                  images ? 'aspect-square overflow-hidden' : 'flex items-center gap-2 p-3',
                )}
              >
                {images ? (
                  <img src={urls.get(f.id)} alt={f.file.name} className="size-full object-cover" />
                ) : (
                  <>
                    <Icon name="file" size={20} className="text-icon" />
                    <span className="text-body-m min-w-0 flex-1 truncate" dir="auto">
                      {f.file.name}
                    </span>
                  </>
                )}
                {st?.state === 'uploading' ? (
                  <span className="bg-surface/70 text-label-s absolute inset-0 flex items-center justify-center">
                    در حال بارگذاری…
                  </span>
                ) : null}
                {st?.state === 'failed' ? (
                  <button
                    type="button"
                    onClick={st.onRetry}
                    className="bg-danger text-caption text-fg-inverse absolute inset-x-1 bottom-1 rounded-sm px-2 py-1"
                  >
                    تلاش دوباره
                  </button>
                ) : null}
                {images ? (
                  <button
                    type="button"
                    onClick={() => onChange(value.map((x) => ({ ...x, primary: x.id === f.id })))}
                    className={cn(
                      'text-caption absolute start-1 top-1 rounded-full px-2 py-0.5',
                      f.primary ? 'bg-brand text-fg-inverse' : 'bg-surface/90 text-fg-secondary',
                    )}
                    aria-pressed={!!f.primary}
                  >
                    {f.primary ? 'اصلی' : 'انتخاب اصلی'}
                  </button>
                ) : null}
                <IconButton
                  icon="trash"
                  label={`حذف ${f.file.name}`}
                  tone="danger"
                  size={18}
                  onClick={() => remove(f.id)}
                  className={images ? 'bg-surface/90 absolute end-0 top-0' : ''}
                />
              </li>
            );
          })}
        </ul>
      ) : null}
      {value.length < maxFiles ? (
        <Button
          variant="secondary"
          iconStart={images ? 'image' : 'upload'}
          onClick={() => input.current?.click()}
        >
          {images ? 'افزودن تصویر' : 'انتخاب فایل'}
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
