'use client';
import { PageState } from '@dukani/ui-kit';
import { useState } from 'react';

import { useStoreSetup } from '../hooks/use-store-setup';
import { useStoreTypes } from '../hooks/use-store-types';
import { StoreContactStep } from '../components/StoreContactStep';
import { StoreHoursStep } from '../components/StoreHoursStep';
import { StoreLocationStep } from '../components/StoreLocationStep';
import { StorePrivateStep } from '../components/StorePrivateStep';
import { StoreSetupForm } from '../components/StoreSetupForm';
import { StoreSetupResult } from '../components/StoreSetupResult';
import { StoreTypeStep } from '../components/StoreTypeStep';
import type { CreateStoreScreenProps, SetupView } from './CreateStoreScreen.types';

/**
 * F02 STORE-01 → STORE-SUCCESS on one route: setup (Figma 312:8744 / 312:201), ST02 type (385:6827), the
 * optional steps contact (358:481), location (594:6736), hours (594:6767) and owner/bank (358:482), then the
 * result. Before the store exists every step only edits the pending draft (F02-S03).
 */
export function CreateStoreScreen({ onBack, onExit }: CreateStoreScreenProps) {
  const setup = useStoreSetup();
  const types = useStoreTypes();
  const [view, setView] = useState<SetupView>('setup');
  // sub-steps opened from «تماس و نشانی» return there; the others return to setup
  const [fromContact, setFromContact] = useState(false);
  const draft = setup.draft;

  if (setup.store)
    return (
      <StoreSetupResult
        store={setup.store}
        sections={setup.sections}
        errors={setup.sectionErrors}
        busy={setup.busy}
        onRetry={(section) => void setup.retrySection(section)}
        onExit={(to) => {
          const store = setup.store!;
          void setup.finish().then(() => onExit(store, to));
        }}
      />
    );
  if (!draft) return <PageState kind="loading" rows={3} />;

  const back = () => setView(fromContact ? 'contact' : 'setup');
  const contact = draft.contact;

  switch (view) {
    case 'type':
      return (
        <StoreTypeStep
          types={types.data ?? []}
          loading={types.isPending}
          value={draft.storeTypeId}
          onBack={() => setView('setup')}
          onPick={(t) => {
            setup.update({ storeTypeId: t.id });
            setView('setup');
          }}
        />
      );
    case 'contact':
      return (
        <StoreContactStep
          value={contact}
          hours={draft.hours}
          logo={setup.logo}
          onLogo={setup.setLogo}
          onSave={(c) => {
            setup.update({ contact: c });
            setFromContact(false);
            setView('private');
          }}
          onOpen={(target, c) => {
            setup.update({ contact: c });
            setFromContact(true);
            setView(target);
          }}
          onSkip={() => {
            setFromContact(false);
            setView('setup');
          }}
        />
      );
    case 'location':
      return (
        <StoreLocationStep
          addressLine={contact?.addressLine ?? null}
          value={draft.location}
          onSave={(addressLine, location) => {
            setup.update({
              contact: { phone: null, email: null, postalCode: null, ...contact, addressLine },
              location,
            });
            back();
          }}
          onSkip={back}
        />
      );
    case 'hours':
      return (
        <StoreHoursStep
          value={draft.hours}
          onSave={(hours) => {
            setup.update({ hours });
            back();
          }}
          onBack={back}
        />
      );
    case 'private':
      return (
        <StorePrivateStep
          value={setup.privateInfo}
          onSave={(p) => {
            setup.setPrivateInfo(p);
            setFromContact(false);
            setView('setup');
          }}
          onSkip={() => {
            const ret = fromContact ? 'contact' : 'setup';
            setFromContact(false);
            setView(ret);
          }}
        />
      );
    default:
      return (
        <StoreSetupForm
          setup={setup}
          types={types.data ?? []}
          onPickType={() => setView('type')}
          onMoreInfo={() => setView('contact')}
          onBack={onBack}
        />
      );
  }
}
