'use client';
import { useId, useRef, useState } from 'react';
import { useAppQuery, useQueryCache } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { parseBarcode } from '@dukani/domain';
import { Alert, BarcodeField, Button, FormScene, PageState } from '@dukani/ui-kit';
import { useProductEntryModule } from '../../module';
import { useEntryTranslations } from '../i18n/use-entry-translations';
export function BarcodeCaptureForm({
  onCode,
  onClose,
}: {
  onCode: (code: string) => void;
  onClose: () => void;
}) {
  const { capture } = useProductEntryModule();
  const store = useActiveStore();
  const t = useEntryTranslations();
  const query = useAppQuery({
    queryKey: ['barcode-capture', store.id],
    queryFn: () => capture.read(store.id),
    staleTime: Infinity,
  });
  return query.error || query.isPending ? (
    <FormScene
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t('manualBarcode')}
    >
      {query.error ? (
        <PageState
          kind="error"
          action={
            <Button
              onClick={() => {
                void query.refetch();
              }}
            >
              {t('retry')}
            </Button>
          }
        />
      ) : query.isPending ? (
        <PageState kind="loading" />
      ) : null}
    </FormScene>
  ) : (
    <CaptureFields key={store.id} initial={query.data?.code ?? ''} onCode={onCode} onClose={onClose} />
  );
}
function CaptureFields({
  initial,
  onCode,
  onClose,
}: {
  initial: string;
  onCode: (code: string) => void;
  onClose: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const formId = useId();
  const [code, setCode] = useState(initial);
  const [invalid, setInvalid] = useState(false);
  const [failed, setFailed] = useState(false);
  const store = useActiveStore();
  const { capture } = useProductEntryModule();
  const cache = useQueryCache();
  const t = useEntryTranslations();
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = parseBarcode(code);
    if (!parsed.ok) {
      setInvalid(true);
      input.current?.focus();
      return;
    }
    onCode(parsed.value);
  };
  return (
    <FormScene
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t('manualBarcode')}
      actions={
        <>
          <Button type="submit" form={formId} block>
            {t('checkBarcode')}
          </Button>
          <Button block variant="secondary" onClick={onClose}>
            {t('backToScanner')}
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={submit} className="flex flex-col gap-4">
        {failed ? <Alert tone="danger" title={t('draftSaveFailed')} /> : null}
        <BarcodeField
          label={t('packBarcode')}
          ref={input}
          autoFocus
          required
          value={code}
          status={invalid ? 'error' : 'default'}
          message={invalid ? t('invalidBarcode') : undefined}
          hint={t('barcodeNumberHint')}
          onChange={(value) => {
            setCode(value);
            setInvalid(false);
            const draft = { schemaVersion: 1 as const, code: value, origin: 'manual' as const };
            void capture.write(store.id, draft).then(
              () => {
                cache.set(['barcode-capture', store.id], draft);
                setFailed(false);
              },
              () => setFailed(true),
            );
          }}
        />
      </form>
    </FormScene>
  );
}
