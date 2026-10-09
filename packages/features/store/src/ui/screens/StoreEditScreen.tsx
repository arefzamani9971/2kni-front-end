'use client';
import { useAppErrorMessage } from '@dukani/ui-kit';
import { useStoreTranslations } from '../i18n/use-store-translations';

import { useCan } from '@dukani/platform';
import { Alert, Button, ConfirmDialog, FlowShell, PageState } from '@dukani/ui-kit';
import { useState } from 'react';
import { useStoreTypeChange } from '../hooks/use-store-type-change';
import { toOpeningHours } from '../../domain/store-draft';
import { applyProfilePatch, contactFields, hoursPlanFromRows } from '../../domain/store-profile';
import type { ProfilePatch } from '../../domain/store-profile.types';
import { LeaveFormView } from '../components/LeaveFormView';
import { StoreContactStep } from '../components/StoreContactStep';
import { StoreEditForm } from '../components/StoreEditForm';
import type { StoreEditValues } from '../components/StoreEditForm.types';
import { StoreHoursStep } from '../components/StoreHoursStep';
import { StoreLocationStep } from '../components/StoreLocationStep';
import { StorePrivateStep } from '../components/StorePrivateStep';
import { StoreTypeStep } from '../components/StoreTypeStep';
import { usePrivateInfoEditor, useStoreProfileEditor } from '../hooks/use-store-profile-editor';
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
  const contact = {
    phone: effective.phone ?? null,
    email: effective.email ?? null,
    addressLine: effective.address?.line ?? null,
    postalCode: effective.address?.postalCode ?? null,
  };
  const a = effective.address;
  const location = a?.latitude != null && a.longitude != null ? { lat: a.latitude, lng: a.longitude } : null;
  const hours = hoursPlanFromRows(effective.openingHours ?? []);

  const profileError = previewError ?? editor.saveError;
  const banner = editor.conflict ? (
    <Alert tone="warning" title={t('conflict')} description={t('profileConflict')} />
  ) : editor.logoError ? (
    <Alert title={t('uploadFailed')} description={errorMessage(editor.logoError)} />
  ) : profileError && profileError.kind !== 'Validation' ? (
    <Alert title={t('notSaved')} description={errorMessage(profileError)} />
  ) : undefined;

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
    case 'private': {
      const leave = entry === 'private' ? onDone : () => setView(returnTo);
      if (!priv.value)
        return (
          <FlowShell appBar={{ title: t('ownerSettlement'), back: leave }}>
            {priv.loadError ? (
              <PageState
                kind={priv.loadError.kind === 'Permission' ? 'permission' : 'error'}
                description={errorMessage(priv.loadError)}
              />
            ) : (
              <PageState kind="loading" rows={4} />
            )}
          </FlowShell>
        );
      return (
        <StorePrivateStep
          context="edit"
          value={priv.value}
          busy={priv.saving}
          banner={
            priv.conflict ? (
              <Alert tone="warning" title={t('conflict')} description={t('privateConflict')} />
            ) : priv.saveError && priv.saveError.kind !== 'Validation' ? (
              <Alert title={t('notSaved')} description={errorMessage(priv.saveError)} />
            ) : undefined
          }
          onSave={(v) => void priv.save(v).then((ok) => ok && leave())}
          onSkip={leave}
        />
      );
    }
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
