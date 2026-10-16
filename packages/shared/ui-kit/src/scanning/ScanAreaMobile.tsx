'use client';
import { Alert } from '../feedback/Alert';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { Button } from '../primitives/Button';
import type { ScanAreaProps } from './ScanArea.types';
import { ScanCamera } from './ScanCamera';
import { CAMERA_FAILED, CAMERA_ON } from './ScanStatus.constants';
import { ScanStatus } from './ScanStatus';

/** Mobile: the standard camera (360 or 220) with an explicit on/off button, then manual entry; status announced. */
export function ScanAreaMobile({ status, message, manual, camera, size = 'regular' }: ScanAreaProps) {
  const t = useUiTranslations();
  const on = camera ? CAMERA_ON.has(camera.state) : false;
  const failed = camera ? CAMERA_FAILED.has(camera.state) : false;
  return (
    <div className="flex flex-col gap-3">
      {camera ? (
        <ScanCamera
          videoRef={camera.videoRef}
          active={camera.state === 'scanning'}
          hint={t('scanArea.hint')}
          status={on ? t('scanArea.scanning') : t('scanArea.hint')}
          size={size}
        />
      ) : null}
      {camera ? (
        <Button variant="secondary" iconStart="camera" onClick={() => (on ? camera.stop() : void camera.start())}>
          {on ? t('scanArea.cameraOff') : t('scanArea.cameraOn')}
        </Button>
      ) : null}
      {failed ? (
        <Alert
          tone="warning"
          title={camera?.state === 'denied' ? t('scanArea.cameraDenied') : t('scanArea.cameraUnavailable')}
        />
      ) : null}
      {status !== 'idle' || !camera ? <ScanStatus status={status} message={message} /> : null}
      {manual}
    </div>
  );
}
