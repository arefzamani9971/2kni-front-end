'use client';
import type { ReactNode } from 'react';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import { SUBTLE } from '../primitives/Badge.constants';
import type { ScanAreaStatus } from './ScanArea.types';
import { SCAN_STATUS_TONE } from './ScanStatus.constants';

/** Live scan status pill (desktop «بارکدخوان آماده است», resolving, found, not found); colors from status tokens. */
export function ScanStatus({ status, message }: { status: ScanAreaStatus; message?: ReactNode }) {
  const t = useUiTranslations();
  const text =
    message ??
    {
      idle: t('scanArea.ready'),
      resolving: t('scanArea.resolving'),
      found: t('scanArea.found'),
      'not-found': t('scanArea.notFound'),
      invalid: t('controls.barcodeInvalid'),
      error: t('scanArea.error'),
    }[status];
  return (
    <p
      role="status"
      className={cn(
        'text-label-s inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5',
        SUBTLE[SCAN_STATUS_TONE[status]],
      )}
    >
      {status === 'resolving' ? (
        <Icon name="spinner" size={14} className="animate-spin" />
      ) : (
        <Icon name="scan" size={16} />
      )}
      {text}
    </p>
  );
}
