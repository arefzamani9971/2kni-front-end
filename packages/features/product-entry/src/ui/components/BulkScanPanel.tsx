'use client';
import { Button, ScanWorkspace } from '@dukani/ui-kit';
import type { useBarcodeCamera } from '../hooks/use-barcode-camera';
import { useEntryTranslations } from '../i18n/use-entry-translations';

/** Continuous camera scanning of the bulk list, with manual entry, table view, scan settings and undo. */
export function BulkScanPanel({
  camera,
  feedback,
  canUndo,
  onUndo,
  onManual,
  onTable,
  onSettings,
}: {
  camera: ReturnType<typeof useBarcodeCamera>;
  feedback: string;
  canUndo: boolean;
  onUndo: () => void;
  onManual: () => void;
  onTable: () => void;
  onSettings: () => void;
}) {
  const t = useEntryTranslations();
  return (
    <>
      <ScanWorkspace
        videoRef={camera.videoRef}
        active={camera.state === 'scanning'}
        preview
        hint={t('scanAimHint')}
        status={feedback || t(`camera.${camera.state}`)}
        actions={[
          { kind: 'keyboard', label: t('manualBarcode'), onClick: onManual },
          { kind: 'layers', label: t('bulk.table'), onClick: onTable },
          { kind: 'settings', label: t('scanSettings'), onClick: onSettings },
        ]}
      />
      <Button
        variant="secondary"
        disabled={camera.state === 'requesting' || camera.state === 'scanning'}
        onClick={() => void camera.start()}
      >
        {t('allowCamera')}
      </Button>
      <Button variant="secondary" disabled={!canUndo} onClick={onUndo}>
        {t('bulk.undo')}
      </Button>
    </>
  );
}
