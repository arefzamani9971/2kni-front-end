'use client';
import { useState } from 'react';
import { parseBarcode } from '@dukani/domain';
import { useActiveStore, useBarcodeCamera, useHardwareScanner, type ScanSource } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Alert, Button, ScanPrompt, ScanStatus, ScanWorkspace, Section } from '@dukani/ui-kit';
import { EntryShell } from '../components/EntryShell';
import { BarcodeCaptureForm } from '../components/BarcodeCaptureForm';
import { useEntryNav } from '../hooks/use-entry-nav';
import { useEntryTranslations } from '../i18n/use-entry-translations';

/**
 * Scan screen of product entry (F08, PAT-SCAN-01 policy `select-one`): the camera (on a user action), a hardware
 * scanner anywhere on the page without a button, and manual entry all hand the same canonical code to the lookup
 * (F09). An invalid code from the scanner sends no request.
 */
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
  const [reader, setReader] = useState<'idle' | 'invalid'>('idle');
  const lookup = (code: string, origin: ScanSource) =>
    go.nav.push(sellerRoutes.entry.search(store.id, code, bulk) + '&origin=' + origin);
  const camera = useBarcodeCamera((code) => lookup(code, 'camera'), { resetKey: store.id });
  useHardwareScanner((raw) => {
    const parsed = parseBarcode(raw);
    if (!parsed.ok) {
      setReader('invalid');
      return;
    }
    camera.stop();
    lookup(parsed.value, 'hardware');
  });
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
      <div className="desktop:flex hidden">
        <ScanStatus status={reader} message={reader === 'invalid' ? t('invalidBarcode') : undefined} />
      </div>
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
