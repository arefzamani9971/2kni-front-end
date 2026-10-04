'use client';
import { useFinalCommand } from '@dukani/data';
import { isAppError, newOperationId, type AppError, type OperationId } from '@dukani/domain';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { StoreProfile } from '../../application/ports';
import { EMPTY_STORE_DRAFT } from '../../domain/store-draft.constants';
import { hasPrivateInfo, hasPublicInfo, toPrivateRequest, toProfileRequest } from '../../domain/store-draft';
import type { SetupSection, StoreDraft, StorePrivateDraft } from '../../domain/store-draft.types';
import { useStoreModule } from '../../module';
import { storeKeys } from './store-keys';
import type { SetupSections, StoreSetup } from './use-store-setup.types';

const NOTHING: SetupSections = { profile: 'skipped', logo: 'skipped', private: 'skipped' };
const ORDER: readonly SetupSection[] = ['profile', 'logo', 'private'];

/**
 * F02 orchestration (§8): the pending draft (required + optional public data) is saved per user;
 * private data and the logo stay in memory only. «ساخت فروشگاه» sends `POST /stores` once with a
 * persisted operation id, then saves profile → logo → private on that same store. A failed section is
 * retried alone; the create is never sent again (AC04).
 */
export const useStoreSetup = (): StoreSetup => {
  const { stores, drafts } = useStoreModule();
  const [draft, setDraft] = useState<StoreDraft | null>(null);
  const [privateInfo, setPrivateInfo] = useState<StorePrivateDraft | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [sections, setSections] = useState<SetupSections>(NOTHING);
  const [sectionErrors, setSectionErrors] = useState<Partial<Record<SetupSection, AppError>>>({});
  const latest = useRef({ draft, privateInfo, logo, store });
  useLayoutEffect(() => {
    latest.current = { draft, privateInfo, logo, store };
  });

  const persist = useCallback(
    (next: StoreDraft) => {
      setDraft(next);
      latest.current.draft = next;
      void drafts.save(next).catch(() => undefined); // a lost draft write never blocks the form
    },
    [drafts],
  );

  const runSection = useCallback(
    async (section: SetupSection, current: StoreProfile): Promise<StoreProfile> => {
      const { draft: d, logo: file, privateInfo: p } = latest.current;
      setSections((s) => ({ ...s, [section]: 'saving' }));
      try {
        let next = current;
        if (section === 'profile' && d)
          next = (await stores.updateProfile(current.id, toProfileRequest(current, d))).profile;
        // every save returns the new store version; the next section sends that one
        if (section === 'logo' && file) next = (await stores.uploadLogo(current.id, file, current.version)).profile;
        if (section === 'private' && hasPrivateInfo(p))
          await stores.updatePrivateInfo(current.id, toPrivateRequest(p));
        setSections((s) => ({ ...s, [section]: 'done' }));
        setSectionErrors((x) => {
          const next = { ...x };
          delete next[section];
          return next;
        });
        setStore(next);
        latest.current.store = next;
        return next;
      } catch (e) {
        setSections((s) => ({ ...s, [section]: 'failed' }));
        if (isAppError(e)) setSectionErrors((x) => ({ ...x, [section]: e }));
        return current;
      }
    },
    [stores],
  );

  // after the store exists: every chosen section, each with its own result (partial completion)
  const completeSections = useCallback(
    async (created: StoreProfile) => {
      const { draft: d, logo: file, privateInfo: p } = latest.current;
      const wanted: SetupSections = {
        profile: d && hasPublicInfo(d) ? 'pending' : 'skipped',
        logo: file ? 'pending' : 'skipped',
        private: hasPrivateInfo(p) ? 'pending' : 'skipped',
      };
      setSections(wanted);
      let current = created;
      for (const section of ORDER)
        if (wanted[section] === 'pending') current = await runSection(section, current);
    },
    [runSection],
  );

  // the key is the one persisted in the draft (not a fresh one): a replay after refresh is the same create
  const command = useFinalCommand<StoreDraft, StoreProfile>({
    run: async (d) =>
      (
        await stores.create(
          { name: d.name.trim(), storeTypeId: d.storeTypeId, businessMode: d.businessMode },
          d.operationId as OperationId,
        )
      ).profile,
    invalidates: [storeKeys().list()],
    onSuccess: async (created) => {
      const d = latest.current.draft;
      if (d) persist({ ...d, storeId: created.id });
      setStore(created);
      latest.current.store = created;
      await completeSections(created);
    },
  });

  // load the pending draft; a draft whose store already exists resumes at the result (no second create)
  useEffect(() => {
    let alive = true;
    void (async () => {
      const saved = await drafts.load().catch(() => null);
      if (!alive) return;
      const d = saved ?? EMPTY_STORE_DRAFT;
      setDraft(d);
      latest.current.draft = d;
      if (!d.storeId) return;
      const existing = await stores.get(d.storeId).catch(() => null);
      if (!alive || !existing) return;
      setStore(existing.profile);
      latest.current.store = existing.profile;
      await completeSections(existing.profile);
    })();
    return () => {
      alive = false;
    };
  }, [drafts, stores, completeSections]);

  const update = useCallback(
    (patch: Partial<StoreDraft>) => {
      const d = latest.current.draft ?? EMPTY_STORE_DRAFT;
      // name/type are frozen while a create result is unknown (F02 §11)
      if (
        d.operationId &&
        !d.storeId &&
        ('name' in patch || 'storeTypeId' in patch || 'businessMode' in patch)
      ) {
        if (command.state.kind === 'unknown' || command.busy) return;
      }
      persist({ ...d, ...patch });
    },
    [persist, command.state.kind, command.busy],
  );

  const create = useCallback(async () => {
    const d = latest.current.draft;
    if (!d || d.storeId) return;
    // the operation id is saved before the request leaves, so a refresh replays the same create
    const operationId = d.operationId ?? newOperationId();
    const next = { ...d, operationId };
    persist(next);
    await command.submit(next);
  }, [persist, command]);

  const checkAgain = useCallback(async () => void (await command.retry()), [command]);

  const retrySection = useCallback(
    async (section: SetupSection) => {
      const current = latest.current.store;
      if (current) await runSection(section, current);
    },
    [runSection],
  );

  const finish = useCallback(async () => {
    await drafts.clear().catch(() => undefined);
  }, [drafts]);

  return {
    draft,
    privateInfo,
    logo,
    update,
    setPrivateInfo,
    setLogo,
    create,
    createState: command.state,
    checkAgain,
    busy: command.busy || Object.values(sections).includes('saving'),
    store,
    sections,
    sectionErrors,
    retrySection,
    finish,
  };
};
