'use client';
import { useEffect, useRef, useState } from 'react';
import { useActiveStore, useCan, useDebounced } from '@dukani/platform';
import {
  canonicalShortcuts,
  dropShortcut,
  isDefinitiveShortcutFailure,
  moveShortcut,
  normalizeShortcut,
  sameShortcuts,
  validShortcut,
} from '../../domain/shortcut';
import type { ShortcutConfiguration, ShortcutDraft, ShortcutItem } from '../../domain/shortcut.types';
import { useProductsModule } from '../../module';
import { useProductList } from './use-product-list';

/**
 * The shortcut configuration editor in one place: add, reorder, show/hide, remove and the versioned save. Edits and
 * the frozen save request are kept in a local draft, so a lost response is retried with the same request.
 */
export function useShortcutEditor(initial: ShortcutConfiguration | ShortcutDraft) {
  const store = useActiveStore();
  const can = useCan('product.manage');
  const { products, shortcutDrafts } = useProductsModule();
  const [items, setItems] = useState<readonly ShortcutItem[]>(initial.items);
  const [code, setCode] = useState('code' in initial ? initial.code : '');
  const [productId, setProductId] = useState('productId' in initial ? initial.productId : '');
  const [query, setQuery] = useState('query' in initial ? initial.query : '');
  const [pending, setPending] = useState<ShortcutConfiguration | undefined>(
    'pending' in initial ? initial.pending : undefined,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [saved, setSaved] = useState(false);
  const lock = useRef(false);
  const version = useRef(initial.version);
  const frozen = !!pending;
  const editable = can && !busy && !frozen;
  const draft = (frozenIntent: ShortcutConfiguration | undefined) => ({
    schemaVersion: 1 as const,
    version: version.current,
    items,
    code,
    productId,
    query,
    pending: frozenIntent,
  });
  useEffect(() => {
    void shortcutDrafts
      .write(store.id, { schemaVersion: 1, version: version.current, items, code, productId, query, pending })
      .catch(() => setError(true));
  }, [items, code, productId, query, pending, shortcutDrafts, store.id]);
  const list = useProductList({ q: useDebounced(query.trim()), stock: 'Any', cost: 'Any' });
  const canonical = normalizeShortcut(code);
  const duplicate = items.some((i) => i.code === canonical);
  const edit = (change: (current: readonly ShortcutItem[]) => readonly ShortcutItem[]) => {
    if (!editable) return;
    setSaved(false);
    setItems(change);
  };
  const accept = (result: ShortcutConfiguration) => {
    setPending(undefined);
    version.current = result.version;
    setItems(result.items);
    setSaved(true);
    setError(false);
  };

  const add = async () => {
    if (!editable) return;
    const selected = list.items.find((i) => i.id === productId);
    if (!selected || !validShortcut(canonical) || duplicate) return setInvalid(true);
    setBusy(true);
    try {
      const detail = await products.get(store.id, selected.id);
      const isEligible = detail.status === 'Active' && detail.units.some((u) => u.isSellable);
      setItems((current) => [
        ...current,
        {
          storeProductId: selected.id,
          title: selected.title,
          code: canonical,
          showInQuickPick: false,
          sortOrder: null,
          isEligible,
        },
      ]);
      setCode('');
      setProductId('');
      setInvalid(false);
      setSaved(false);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(false);
    const intent = pending ?? { version: version.current, items: canonicalShortcuts(items) };
    try {
      await shortcutDrafts.write(store.id, draft(intent));
      setPending(intent);
      accept(await products.replaceShortcuts(store.id, intent.version, intent.items));
    } catch (cause) {
      const kind = cause && typeof cause === 'object' && 'kind' in cause ? cause.kind : undefined;
      if (isDefinitiveShortcutFailure(kind)) setPending(undefined);
      try {
        const current = await products.shortcuts(store.id);
        if (sameShortcuts(current.items, intent.items)) accept(current);
        else setError(true);
      } catch {
        setError(true);
      }
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  return {
    items,
    code,
    setCode,
    productId,
    setProductId,
    query,
    setQuery,
    list,
    busy,
    frozen,
    editable,
    canManage: can,
    error,
    invalid,
    duplicate,
    saved,
    add,
    submit,
    move: (id: string, offset: number) => edit((current) => moveShortcut(current, id, offset)),
    drop: (fromId: string, toId: string) => edit((current) => dropShortcut(current, fromId, toId)),
    toggle: (id: string, showInQuickPick: boolean) =>
      edit((current) => current.map((i) => (i.storeProductId === id ? { ...i, showInQuickPick } : i))),
    remove: (id: string) => edit((current) => current.filter((i) => i.storeProductId !== id)),
  };
}
