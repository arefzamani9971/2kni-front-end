'use client';
import { useState } from 'react';
import { useActiveStore } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Alert, Button, ScanPrompt, ScanWorkspace, Section } from '@dukani/ui-kit';
import { EntryShell } from '../components/EntryShell';
import { BarcodeCaptureForm } from '../components/BarcodeCaptureForm';
import { useBarcodeCamera } from '../hooks/use-barcode-camera';
import { useEntryNav } from '../hooks/use-entry-nav';
import { useEntryTranslations } from '../i18n/use-entry-translations';
export function EntryScanScreen({
  initialManual = false,
  bulk = false,
}: {
  initialManual?: boolean;
  bulk?: boolean;
}) {
  const t = useEntryTranslations();
  const go = useEntryNav();
  const store = useActiveStore();
  const [manual, setManual] = useState(initialManual);
  const [intro, setIntro] = useState(!initialManual);
  const lookup = (code: string, origin: 'manual' | 'camera') =>
    go.nav.push(sellerRoutes.entry.search(store.id, code, bulk) + '&origin=' + origin);
  const camera = useBarcodeCamera((code) => lookup(code, 'camera'));
  const showManual = () => {
    camera.stop();
    setIntro(false);
    setManual(true);
  };
  const start = () => {
    setIntro(false);
    void camera.start();
  };
  const failure = ['denied', 'unsupported', 'unavailable', 'insecure'].includes(camera.state);
  return (
    <EntryShell
      contextualHeader
      mobileNav={false}
      title={
        intro ? (
          <>
            <span className="desktop:hidden">{t('cameraPermission')}</span>
            <span className="desktop:inline hidden">{t('scanBarcode')}</span>
          </>
        ) : (
          t('scanBarcode')
        )
      }
      back={go.method}
      actions={
        <Button
          variant="secondary"
          block
          onClick={() => {
            camera.stop();
            go.method();
          }}
        >
          {t('back')}
        </Button>
      }
    >
      {failure ? <Alert tone="warning" title={t(`camera.${camera.state}`)} /> : null}
      <ScanWorkspace
        videoRef={camera.videoRef}
        active={camera.state === 'scanning'}
        preview={!intro}
        hint={t('scanAimHint')}
        status={t(`camera.${camera.state}`)}
        actions={[
          { kind: 'keyboard', label: t('manualBarcode'), onClick: showManual },
          {
            kind: 'layers',
            label: t('bulkScan'),
            onClick: () => {
              camera.stop();
              go.nav.push(sellerRoutes.entry.bulk(store.id));
            },
          },
          {
            kind: 'settings',
            label: t('scanSettings'),
            onClick: () => {
              camera.stop();
              go.nav.push(sellerRoutes.settings.scan(store.id));
            },
          },
        ]}
      />
      <ScanPrompt
        open={intro}
        onOpenChange={(open) => {
          if (!open) setIntro(false);
        }}
        title={t('cameraPermission')}
        actions={
          <>
            <Button variant="secondary" loading={camera.state === 'requesting'} onClick={start}>
              {t('allowCamera')}
            </Button>
            <Button variant="secondary" onClick={showManual}>
              {t('manualBarcode')}
            </Button>
            <Button className="desktop:inline-flex hidden" variant="secondary" onClick={go.method}>
              {t('back')}
            </Button>
          </>
        }
      >
        <Section title={t('quickScan')}>
          <p>{t('cameraPermissionHint')}</p>
          <p>{t('cameraOptionalHint')}</p>
        </Section>
      </ScanPrompt>
      {!intro && camera.state !== 'scanning' && camera.state !== 'requesting' && !manual ? (
        <Button variant="secondary" onClick={start}>
          {t('resumeCamera')}
        </Button>
      ) : null}
      {manual ? (
        <BarcodeCaptureForm
          onClose={() => setManual(false)}
          onCode={(code) => {
            camera.stop();
            lookup(code, 'manual');
          }}
        />
      ) : null}
    </EntryShell>
  );
}
