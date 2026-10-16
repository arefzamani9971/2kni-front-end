'use client';
import { Alert } from '../feedback/Alert';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { cn } from '../lib/cn';
import { Button } from '../primitives/Button';
import type { ScanAreaProps } from './ScanArea.types';
import { ScanCamera } from './ScanCamera';
import { CAMERA_FAILED, CAMERA_ON } from './ScanStatus.constants';
import { ScanStatus } from './ScanStatus';

/**
 * Desktop: the hardware scanner works with no button (`useScanIntake`), so the area is a status pill and manual
 * entry; the camera is an optional extra, mounted hidden so it can start on demand.
 */
export function ScanAreaDesktop({ status, message, manual, camera }: ScanAreaProps) {
  const t = useUiTranslations();
  const on = camera ? CAMERA_ON.has(camera.state) : false;
  const failed = camera ? CAMERA_FAILED.has(camera.state) : false;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <ScanStatus status={status} message={message} />
        {camera ? (
          <Button
            variant="text"
            size="sm"
            iconStart="camera"
            onClick={() => (on ? camera.stop() : void camera.start())}
          >
            {on ? t('scanArea.cameraOff') : t('scanArea.cameraOn')}
          </Button>
        ) : null}
      </div>
      {camera ? (
        <div className={cn(!on && 'hidden')}>
          <ScanCamera
            videoRef={camera.videoRef}
            active={camera.state === 'scanning'}
            hint={t('scanArea.hint')}
            status={t('scanArea.scanning')}
            size="compact"
          />
        </div>
      ) : null}
      {failed ? (
        <Alert
          tone="warning"
          title={camera?.state === 'denied' ? t('scanArea.cameraDenied') : t('scanArea.cameraUnavailable')}
        />
      ) : null}
      {manual}
    </div>
  );
}
