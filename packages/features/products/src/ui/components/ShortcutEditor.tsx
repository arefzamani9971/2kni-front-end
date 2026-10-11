'use client';
import { useEffect, useRef, useState } from 'react';
import { useActiveStore, useCan, useDebounced, useNavigation } from '@dukani/platform';
import {
  Alert,
  Button,
  ConfirmDialog,
  IconButton,
  PageHeader,
  PageShell,
  PageState,
  RecordList,
  Section,
  SelectField,
  Switch,
  TextField,
} from '@dukani/ui-kit';
import { useProductsModule } from '../../module';
import type { ShortcutConfiguration, ShortcutDraft, ShortcutItem } from '../../domain/shortcut.types';
import { canonicalShortcuts, normalizeShortcut, sameShortcuts, validShortcut } from '../../domain/shortcut';
import { useProductList } from '../hooks/use-product-list';
import { useProductTranslations } from '../i18n/use-product-translations';
export function ShortcutEditor({
  initial,
  reload,
}: {
  initial: ShortcutConfiguration | ShortcutDraft;
  reload: () => Promise<void>;
}) {
  const store = useActiveStore();
  const can = useCan('product.manage');
  const nav = useNavigation();
  const t = useProductTranslations();
  const { products, shortcutDrafts } = useProductsModule();
  const [items, setItems] = useState<readonly ShortcutItem[]>(initial.items);
  const [code, setCode] = useState('code' in initial ? initial.code : '');
  const [productId, setProductId] = useState('productId' in initial ? initial.productId : '');
  const [q, setQ] = useState('query' in initial ? initial.query : '');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<ShortcutConfiguration | undefined>(
    'pending' in initial ? initial.pending : undefined,
  );
  const frozen = !!pending;
  const [error, setError] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [reloadConfirm, setReloadConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const lock = useRef(false);
  const drag = useRef<string | null>(null);
  const version = useRef(initial.version);
  useEffect(() => {
    void shortcutDrafts
      .write(store.id, {
        schemaVersion: 1,
        version: version.current,
        items,
        code,
        productId,
        query: q,
        pending,
      })
      .catch(() => setError(true));
  }, [items, code, productId, q, pending, shortcutDrafts, store.id]);
  const canonicalQuery = useDebounced(q.trim());
  const list = useProductList({ q: canonicalQuery, stock: 'Any', cost: 'Any' });
  const selected = list.items.find((i) => i.id === productId);
  const canonical = normalizeShortcut(code);
  const duplicate = items.some((i) => i.code === canonical);
  const add = async () => {
    if (frozen || busy || !can) return;
    if (!selected || !validShortcut(canonical) || duplicate) {
      setInvalid(true);
      return;
    }
    setBusy(true);
    try {
      const detail = await products.get(store.id, selected.id);
      setItems((current) => [
        ...current,
        {
          storeProductId: selected.id,
          title: selected.title,
          code: canonical,
          showInQuickPick: false,
          sortOrder: null,
          isEligible: detail.status === 'Active' && detail.units.some((u) => u.isSellable),
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
  const move = (id: string, offset: number) => {
    if (frozen || busy || !can) return;
    setSaved(false);
    setItems((current) => {
      const next = [...current];
      const index = next.findIndex((i) => i.storeProductId === id);
      const to = index + offset;
      if (index < 0 || to < 0 || to >= next.length) return current;
      [next[index], next[to]] = [next[to]!, next[index]!];
      return next;
    });
  };
  const drop = (id: string) => {
    if (frozen || busy || !can) return;
    const from = drag.current;
    drag.current = null;
    if (!from || from === id) return;
    setSaved(false);
    setItems((current) => {
      const next = [...current];
      const index = next.findIndex((i) => i.storeProductId === from);
      const to = next.findIndex((i) => i.storeProductId === id);
      if (index < 0 || to < 0) return current;
      next.splice(to, 0, next.splice(index, 1)[0]!);
      return next;
    });
  };
  const accept = (result: ShortcutConfiguration) => {
    setPending(undefined);
    version.current = result.version;
    setItems(result.items);
    setSaved(true);
    setError(false);
  };
  const submit = async () => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(false);
    const intent = pending ?? { version: version.current, items: canonicalShortcuts(items) };
    const body = intent.items;
    try {
      await shortcutDrafts.write(store.id, {
        schemaVersion: 1,
        version: version.current,
        items,
        code,
        productId,
        query: q,
        pending: intent,
      });
      setPending(intent);
      accept(await products.replaceShortcuts(store.id, intent.version, body));
    } catch (cause) {
      const kind = cause && typeof cause === 'object' && 'kind' in cause ? cause.kind : undefined;
      if (
        kind === 'Validation' ||
        kind === 'BusinessRule' ||
        kind === 'Conflict' ||
        kind === 'Permission' ||
        kind === 'Unauthorized' ||
        kind === 'NotFound'
      )
        setPending(undefined);
      try {
        const current = await products.shortcuts(store.id);
        if (sameShortcuts(current.items, body)) accept(current);
        else setError(true);
      } catch {
        setError(true);
      }
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const save = (
    <Button loading={busy} disabled={!can || busy || frozen} onClick={() => void submit()}>
      {t('shortcuts.save')}
    </Button>
  );
  return (
    <PageShell
      title={t('shortcuts.title')}
      header={
        <PageHeader
          back={nav.back}
          title={t('shortcuts.title')}
          subtitle={t('shortcuts.hint')}
          actions={save}
        />
      }
      actions={save}
      actionsClassName="desktop:hidden"
    >
      <Section title={t('shortcuts.preview')}>
        <div className="desktop:grid-cols-5 grid grid-cols-2 gap-3">
          {items
            .filter((i) => i.showInQuickPick && i.isEligible)
            .map((item) => (
              <div className="border-line rounded-lg border p-4" key={item.storeProductId}>
                <bdi className="text-fg-brand">{item.code}</bdi>
                <p className="text-body-m">{item.title}</p>
              </div>
            ))}
        </div>
      </Section>
      {saved ? <Alert tone="info" title={t('shortcuts.saved')} /> : null}
      {frozen ? (
        <PageState
          kind="unknown-result"
          action={
            <Button disabled={busy} onClick={() => void submit()}>
              {t('retry')}
            </Button>
          }
        />
      ) : null}
      {error ? <Alert tone="danger" title={t('shortcuts.failed')} /> : null}
      {error ? (
        <Button variant="secondary" onClick={() => setReloadConfirm(true)}>
          {t('shortcuts.reload')}
        </Button>
      ) : null}
      <div className="desktop:grid-cols-3 grid gap-6">
        <Section title={t('shortcuts.items')} className="desktop:col-span-2">
          <RecordList
            label={t('shortcuts.items')}
            columns={[t('shortcuts.code'), t('product'), t('shortcuts.show'), t('shortcuts.order')]}
            rows={items.map((item, index) => {
              const toggle = (
                <Switch
                  label={t('shortcuts.show')}
                  checked={item.showInQuickPick}
                  disabled={!can || busy || frozen || (!item.isEligible && !item.showInQuickPick)}
                  onChange={(showInQuickPick) => {
                    setSaved(false);
                    setItems((current) =>
                      current.map((i) =>
                        i.storeProductId === item.storeProductId ? { ...i, showInQuickPick } : i,
                      ),
                    );
                  }}
                />
              );
              const order = (
                <div className="flex gap-2">
                  <IconButton
                    icon="chevron-up"
                    label={t('shortcuts.up')}
                    disabled={busy || frozen || !can || index === 0}
                    onClick={() => move(item.storeProductId, -1)}
                  />
                  <IconButton
                    icon="chevron-down"
                    label={t('shortcuts.down')}
                    disabled={busy || !can || index === items.length - 1}
                    onClick={() => move(item.storeProductId, 1)}
                  />
                  <IconButton
                    icon="trash"
                    label={t('shortcuts.remove')}
                    disabled={!can || busy || frozen}
                    onClick={() => {
                      setSaved(false);
                      setItems((current) => current.filter((i) => i.storeProductId !== item.storeProductId));
                    }}
                  />
                </div>
              );
              const title = (
                <div
                  draggable={can && !busy && !frozen}
                  onDragStart={() => {
                    drag.current = item.storeProductId;
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => drop(item.storeProductId)}
                >
                  {item.title}
                </div>
              );
              return {
                id: item.storeProductId,
                card: (
                  <div className="border-line flex flex-col gap-3 rounded-lg border p-4">
                    <bdi>{item.code}</bdi>
                    {title}
                    {toggle}
                    {order}
                  </div>
                ),
                cells: [<bdi key="code">{item.code}</bdi>, title, toggle, order],
              };
            })}
          />
          <p className="text-body-s text-fg-secondary">{t('shortcuts.hint')}</p>
        </Section>
        <Section title={t('shortcuts.new')}>
          <TextField
            label={t('shortcuts.code')}
            value={code}
            disabled={!can || busy || frozen}
            maxLength={16}
            onChange={setCode}
            status={invalid ? 'error' : undefined}
            message={invalid ? (duplicate ? t('shortcuts.duplicate') : t('shortcuts.invalid')) : undefined}
          />
          <TextField label={t('search')} value={q} onChange={setQ} />
          <SelectField
            label={t('product')}
            value={productId}
            onChange={setProductId}
            options={list.items
              .filter((i) => !items.some((s) => s.storeProductId === i.id))
              .map((i) => ({ value: i.id, label: i.title }))}
            disabled={!can || busy || frozen}
          />
          {list.error ? (
            <PageState
              kind="error"
              action={<Button onClick={() => void list.refetch()}>{t('retry')}</Button>}
            />
          ) : null}
          {list.hasNextPage ? (
            <Button variant="secondary" onClick={() => void list.fetchNextPage()}>
              {t('loadMore')}
            </Button>
          ) : null}
          <Button variant="secondary" disabled={!can || busy || frozen} onClick={add}>
            {t('shortcuts.add')}
          </Button>
        </Section>
      </div>
      <ConfirmDialog
        open={reloadConfirm}
        onOpenChange={setReloadConfirm}
        title={t('shortcuts.reload')}
        description={t('shortcuts.reloadHint')}
        confirmLabel={t('shortcuts.reload')}
        onConfirm={() => {
          setReloadConfirm(false);
          void reload().catch(() => setError(true));
        }}
      />
    </PageShell>
  );
}
