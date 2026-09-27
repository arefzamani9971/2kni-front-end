'use client';
import { toPersianDigits } from '@dukani/domain';
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import type { Status } from '../lib/types';
import { Button } from '../primitives/Button';
import { IconButton } from '../primitives/IconButton';

export type PickedFile = { readonly id: string; readonly file: File; readonly primary?: boolean };

export type FileUploadFieldProps = {
  label: ReactNode;
  value: readonly PickedFile[];
  onChange: (files: PickedFile[]) => void;
  /** e.g. 'image/jpeg,image/png,image/webp' or 'application/pdf,image/*'. */
  accept: string;
  maxFiles?: number;
  maxSizeMb?: number;
  /** Image mode: thumbnails and «اصلی» selection (BIZ-CAT-02: up to 8 images, 10MB). */
  images?: boolean;
  optional?: boolean;
  status?: Status;
  message?: ReactNode;
  hint?: ReactNode;
  /** Per-file upload state shown by the owner feature (uploading/failed with retry). */
  fileState?: (id: string) => { state: 'uploading' | 'failed' | 'done'; onRetry?: () => void } | undefined;
  className?: string;
};

const ACCEPT_MATCH = (accept: string, file: File) =>
  accept.split(',').some((a) => {
    const t = a.trim();
    return t.endsWith('/*') ? file.type.startsWith(t.slice(0, -1)) : file.type === t;
  });

/** File/image picker with previews, limits and per-file states. Uploading is done by the feature. */
export function FileUploadField({ label, value, onChange, accept, maxFiles = 1, maxSizeMb = 10, images, className, ...props }: FileUploadFieldProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const urls = useMemo(() => new Map(value.map((f) => [f.id, images ? URL.createObjectURL(f.file) : ''])), [value, images]);
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
      next.push({ id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`, file, primary: images && next.length === 0 });
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
              <li key={f.id} className={cn('relative rounded-md border border-line bg-surface', images ? 'aspect-square overflow-hidden' : 'flex items-center gap-2 p-3')}>
                {images ? (
                  <img src={urls.get(f.id)} alt={f.file.name} className="size-full object-cover" />
                ) : (
                  <>
                    <Icon name="file" size={20} className="text-icon" />
                    <span className="min-w-0 flex-1 truncate text-body-m" dir="auto">{f.file.name}</span>
                  </>
                )}
                {st?.state === 'uploading' ? <span className="absolute inset-0 flex items-center justify-center bg-surface/70 text-label-s">در حال بارگذاری…</span> : null}
                {st?.state === 'failed' ? (
                  <button type="button" onClick={st.onRetry} className="absolute inset-x-1 bottom-1 rounded-sm bg-danger px-2 py-1 text-caption text-fg-inverse">
                    تلاش دوباره
                  </button>
                ) : null}
                {images ? (
                  <button
                    type="button"
                    onClick={() => onChange(value.map((x) => ({ ...x, primary: x.id === f.id })))}
                    className={cn('absolute start-1 top-1 rounded-full px-2 py-0.5 text-caption', f.primary ? 'bg-brand text-fg-inverse' : 'bg-surface/90 text-fg-secondary')}
                    aria-pressed={!!f.primary}
                  >
                    {f.primary ? 'اصلی' : 'انتخاب اصلی'}
                  </button>
                ) : null}
                <IconButton icon="trash" label={`حذف ${f.file.name}`} tone="danger" size={18} onClick={() => remove(f.id)} className={images ? 'absolute end-0 top-0 bg-surface/90' : ''} />
              </li>
            );
          })}
        </ul>
      ) : null}
      {value.length < maxFiles ? (
        <Button variant="secondary" iconStart={images ? 'image' : 'upload'} onClick={() => input.current?.click()}>
          {images ? 'افزودن تصویر' : 'انتخاب فایل'}
        </Button>
      ) : null}
      <input ref={input} id={id} type="file" accept={accept} multiple={maxFiles > 1} className="sr-only" onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
      {message ? (
        <p aria-live="polite" className={cn('text-caption', status === 'error' ? 'text-danger' : 'text-fg-secondary')}>
          {message}
        </p>
      ) : props.hint ? (
        <p className="text-caption text-fg-secondary">{props.hint}</p>
      ) : null}
    </div>
  );
}
