'use client';
import { useState } from 'react';
import {
  Button,
  PageShell,
  PageState,
  PrintableQr,
  ScreenHeader,
  useQrImage,
  useAppErrorMessage,
} from '@dukani/ui-kit';
import { useStoreQr } from '../hooks/use-store-qr';
import { useStoreTranslations } from '../i18n/use-store-translations';
import type { StoreQrScreenProps } from './StoreQrScreen.types';

export function StoreQrScreen({ storeId, onBack }: StoreQrScreenProps) {
  const t = useStoreTranslations();
  const query = useStoreQr(storeId);
  const message = useAppErrorMessage();
  const qr = query.allowed ? query.data : undefined;
  const image = useQrImage(qr?.joinUrl);
  const [notice, setNotice] = useState<string>();
  const run = async (action: () => void | Promise<void>, success: string) => {
    try {
      await action();
      setNotice(success);
    } catch {
      setNotice(t('qrActionError'));
    }
  };
  return (
    <PageShell
      title={t('qrTitle')}
      subtitle={qr?.displayName}
      header={
        <ScreenHeader
          title={t('qrTitle')}
          subtitle={qr?.displayName}
          className="bg-canvas [&_h1]:text-heading-m desktop:[&_h1]:text-heading-xl"
        />
      }
      mobileNav={false}
      actions={
        <>
          <Button
            disabled={!qr || !image.src}
            onClick={() => void run(() => window.print(), t('qrPrintReturned'))}
          >
            {t('qrPrint')}
          </Button>
          <Button variant="secondary" onClick={onBack}>
            {t('back')}
          </Button>
        </>
      }
    >
      {!query.allowed ? (
        <PageState kind="permission" />
      ) : query.error ? (
        <PageState
          kind="error"
          description={message(query.error)}
          action={<Button onClick={() => void query.refetch()}>{t('retry')}</Button>}
        />
      ) : image.failed ? (
        <PageState
          kind="error"
          description={t('qrActionError')}
          action={<Button onClick={image.retry}>{t('retry')}</Button>}
        />
      ) : !qr || !image.src ? (
        <PageState kind="loading" />
      ) : (
        <>
          <PrintableQr
            src={image.src}
            title={qr.displayName}
            address={qr.address}
            url={qr.joinUrl}
            label={t('qrScanLabel')}
          />
          {!qr.available ? (
            <p role="status" className="bg-info-subtle text-body-m rounded-md p-4">
              {t('qrUnavailable')}
            </p>
          ) : null}
          <div className="desktop:flex-row flex flex-col gap-3">
            <Button
              variant="secondary"
              onClick={() => void run(() => navigator.clipboard.writeText(qr.joinUrl), t('qrCopied'))}
            >
              {t('qrCopy')}
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                void run(() => {
                  const link = document.createElement('a');
                  link.href = image.src!;
                  link.download = `store-${qr.publicCode}.png`;
                  link.click();
                }, t('qrDownloaded'))
              }
            >
              {t('qrDownload')}
            </Button>
          </div>
        </>
      )}
      {notice ? (
        <p role="status" className="text-body-s text-fg-secondary">
          {notice}
        </p>
      ) : null}
    </PageShell>
  );
}
