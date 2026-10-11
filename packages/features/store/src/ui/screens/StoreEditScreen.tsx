'use client';
import { useState } from 'react';
import { useCan } from '@dukani/platform';
import { Button, ConfirmDialog, FlowShell, PageState, useAppErrorMessage } from '@dukani/ui-kit';
import { useStoreTranslations } from '../i18n/use-store-translations';
import { useStoreTypeChange } from '../hooks/use-store-type-change';
import { toOpeningHours } from '../../domain/store-draft';
import { applyProfilePatch, contactFields, editableSections } from '../../domain/store-profile';
import type { ProfilePatch } from '../../domain/store-profile.types';
import { LeaveFormView } from '../components/LeaveFormView';
import { StoreContactStep } from '../components/StoreContactStep';
import { StoreEditBanner } from '../components/StoreEditBanner';
import { StoreEditForm } from '../components/StoreEditForm';
import type { StoreEditValues } from '../components/StoreEditForm.types';
import { StoreHoursStep } from '../components/StoreHoursStep';
import { StoreLocationStep } from '../components/StoreLocationStep';
import { StorePrivateEdit } from '../components/StorePrivateEdit';
import { StoreTypeStep } from '../components/StoreTypeStep';
import { useStoreProfileEditor } from '../hooks/use-store-profile-editor';
import { usePrivateInfoEditor } from '../hooks/use-private-info-editor';
import { useStoreTypes } from '../hooks/use-store-types';
import type { StoreEditScreenProps, StoreEditView } from './StoreInfoScreen.types';

const fromValues = (v: StoreEditValues): ProfilePatch => ({
  name: v.name,
  storeTypeId: v.storeTypeId,
  businessMode: v.businessMode,
  phone: v.phone,
  email: v.email,
  addressLine: v.addressLine,
});

/**
 * F03 editing of an existing store on one route per entry: STORE-05 (385:6912), storeprofile «تماس و نشانی»
 * (358:481) with location (594:6736) and hours (594:6767), and storelegal (358:482). Sub-pages only change the
 * open page's values; the page's save sends `latest store + changes` once (full replace, F03 §8). The logo is
 * uploaded as soon as it is picked (F03 §9) and private data is saved on its own (F03 §2, §8).
 */
export function StoreEditScreen({ storeId, entry, onDone }: StoreEditScreenProps) {
  const t = useStoreTranslations();
  const errorMessage = useAppErrorMessage();

  const allowed = useCan('store.settings');
  const editor = useStoreProfileEditor(storeId);
  const priv = usePrivateInfoEditor(storeId);
  const types = useStoreTypes();
  const [view, setView] = useState<StoreEditView>(entry);
  // where location/hours/private return to (they can be opened from STORE-05 or from «تماس و نشانی»)
  const [returnTo, setReturnTo] = useState<StoreEditView>(entry);
  const [patch, setPatch] = useState<ProfilePatch>({});
  const [logo, setLogo] = useState<File | null>(null);
  const [leaving, setLeaving] = useState(false);
  const { preview, setPreview, previewing, previewError, commit, saveProfile } = useStoreTypeChange(
    editor,
    onDone,
  );

  if (!allowed)
    return (
      <FlowShell appBar={{ title: t('editStore'), back: onDone }}>
        <PageState kind="permission" />
      </FlowShell>
    );

  const base = editor.store;
  if (!base)
    return (
      <FlowShell appBar={{ title: t('editStore'), back: onDone }}>
        {editor.loadError ? (
          <PageState
            kind="error"
            description={errorMessage(editor.loadError)}
            action={<Button onClick={() => void editor.reload()}>{t('retry')}</Button>}
          />
        ) : (
          <PageState kind="loading" rows={4} />
        )}
      </FlowShell>
    );

  const merge = (p: ProfilePatch) => setPatch((cur) => ({ ...cur, ...p }));
  const open = (target: StoreEditView, from: StoreEditView) => {
    setReturnTo(from);
    setView(target);
  };

  const effective = applyProfilePatch(base, patch);
  const { contact, location, hours } = editableSections(effective);

  const profileError = previewError ?? editor.saveError;
  const banner = (
    <StoreEditBanner
      conflict={!!editor.conflict}
      logoError={editor.logoError ?? null}
      saveError={profileError ?? null}
    />
  );

  switch (view) {
    case 'type':
      return (
        <StoreTypeStep
          types={types.data ?? []}
          loading={types.isPending}
          value={effective.storeTypeId}
          onBack={() => setView('edit')}
          onPick={(t) => {
            merge({ storeTypeId: t.id });
            setView('edit');
          }}
        />
      );
    case 'contact':
      return (
        <StoreContactStep
          context="edit"
          value={contact}
          hours={hours}
          logo={logo}
          logoBusy={editor.logoUploading}
          logoUrl={base.logoUrl ?? null}
          busy={editor.saving}
          banner={banner}
          onLogo={(file) => {
            setLogo(file);
            // the server switches the logo at once; a failed upload leaves the text fields as they are (F03-S14)
            if (file) void editor.uploadLogo(file).then((ok) => (ok ? undefined : setLogo(null)));
          }}
          onSave={(c) => {
            if (entry === 'contact') void saveProfile({ ...patch, ...contactFields(c) });
            else {
              merge(contactFields(c));
              setView('edit');
            }
          }}
          onOpen={(target, c) => {
            merge(contactFields(c));
            open(target, 'contact');
          }}
          onSkip={entry === 'contact' ? onDone : () => setView('edit')}
        />
      );
    case 'location':
      return (
        <StoreLocationStep
          context="edit"
          addressLine={contact.addressLine}
          value={location}
          onSave={(addressLine, point) => {
            merge({ addressLine, location: point });
            setView(returnTo);
          }}
          onSkip={() => setView(returnTo)}
        />
      );
    case 'hours':
      return (
        <StoreHoursStep
          value={hours}
          onSave={(plan) => {
            merge({ openingHours: toOpeningHours(plan) });
            setView(returnTo);
          }}
          onBack={() => setView(returnTo)}
        />
      );
    case 'private':
      return (
        <StorePrivateEdit editor={priv} onLeave={entry === 'private' ? onDone : () => setView(returnTo)} />
      );
    default:
      return (
        <>
          {leaving ? <LeaveFormView onStay={() => setLeaving(false)} onDiscard={onDone} /> : null}
          {/* hidden, not unmounted: «ادامه ویرایش» comes back to the typed values */}
          <div className={leaving ? 'hidden' : 'contents'}>
            <StoreEditForm
              values={{
                name: effective.name,
                storeTypeId: effective.storeTypeId,
                businessMode: effective.businessMode ?? null,
                phone: contact.phone,
                email: contact.email,
                addressLine: contact.addressLine,
              }}
              typeName={types.data?.find((t) => t.id === effective.storeTypeId)?.name ?? base.storeType.name}
              canEditPrivate={allowed}
              dirty={Object.keys(patch).length > 0}
              saving={editor.saving || previewing}
              serverError={editor.saveError}
              banner={banner}
              onPickType={(v) => {
                merge(fromValues(v));
                setView('type');
              }}
              onOpen={(target, v) => {
                merge(fromValues(v));
                open(target, 'edit');
              }}
              onSave={(v) => void saveProfile({ ...patch, ...fromValues(v) })}
              onBack={(dirty) => (dirty ? setLeaving(true) : onDone())}
            />
          </div>
          <ConfirmDialog
            open={!!preview}
            onOpenChange={(o) => !o && setPreview(null)}
            title={t('changeType')}
            description={preview ? t('keepProducts', { count: preview.data.productsKept }) : undefined}
            confirmLabel={t('changeTypeSave')}
            cancelLabel={t('cancel')}
            loading={editor.saving}
            onConfirm={() => {
              const p = preview?.patch;
              setPreview(null);
              if (p) void commit(p);
            }}
          >
            {preview && preview.data.categoriesNoLongerSuggested.length ? (
              <p className="text-body-m text-fg-secondary">
                {t('noLongerSuggested')}
                {preview.data.categoriesNoLongerSuggested.join('، ')}
              </p>
            ) : null}
          </ConfirmDialog>
        </>
      );
  }
}
