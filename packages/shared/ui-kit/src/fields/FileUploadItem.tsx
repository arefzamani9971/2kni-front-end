'use client';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import { IconButton } from '../primitives/IconButton';
import type { FileUploadItemProps } from './FileUploadItem.types';

/** One picked file: thumbnail (image mode) or name, its upload state, the «اصلی» toggle and remove. */
export function FileUploadItem({ file, images, url, state, onPrimary, onRemove }: FileUploadItemProps) {
  const t = useUiTranslations();
  return (
    <li
      className={cn(
        'border-line bg-surface relative rounded-md border',
        images ? 'aspect-square overflow-hidden' : 'flex items-center gap-2 p-3',
      )}
    >
      {images ? (
        <img src={url} alt={file.file.name} className="size-full object-cover" />
      ) : (
        <>
          <Icon name="file" size={20} className="text-icon" />
          <span className="text-body-m min-w-0 flex-1 truncate" dir="auto">
            {file.file.name}
          </span>
        </>
      )}
      {state?.state === 'uploading' ? (
        <span className="bg-surface/70 text-label-s absolute inset-0 flex items-center justify-center">
          {t('controls.uploading')}
        </span>
      ) : null}
      {state?.state === 'failed' ? (
        <button
          type="button"
          onClick={state.onRetry}
          className="bg-danger text-caption text-fg-inverse absolute inset-x-1 bottom-1 rounded-sm px-2 py-1"
        >
          {t('controls.retry')}
        </button>
      ) : null}
      {images ? (
        <button
          type="button"
          onClick={onPrimary}
          className={cn(
            'text-caption absolute start-1 top-1 rounded-full px-2 py-0.5',
            file.primary ? 'bg-brand text-fg-inverse' : 'bg-surface/90 text-fg-secondary',
          )}
          aria-pressed={!!file.primary}
        >
          {file.primary ? t('controls.primary') : t('controls.setPrimary')}
        </button>
      ) : null}
      <IconButton
        icon="trash"
        label={t('upload.removeFile', { name: file.file.name })}
        tone="danger"
        size={18}
        onClick={onRemove}
        className={images ? 'bg-surface/90 absolute end-0 top-0' : ''}
      />
    </li>
  );
}
