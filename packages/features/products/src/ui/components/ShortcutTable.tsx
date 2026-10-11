'use client';
import { useRef } from 'react';
import { IconButton, RecordList, Section, Switch } from '@dukani/ui-kit';
import type { useShortcutEditor } from '../hooks/use-shortcut-editor';
import { useProductTranslations } from '../i18n/use-product-translations';

/** Configured shortcuts: code, product, quick-pick visibility and order (buttons or drag and drop). */
export function ShortcutTable({ editor }: { editor: ReturnType<typeof useShortcutEditor> }) {
  const t = useProductTranslations();
  const drag = useRef<string | null>(null);
  const { items, editable } = editor;
  return (
    <Section title={t('shortcuts.items')} className="desktop:col-span-2">
      <RecordList
        label={t('shortcuts.items')}
        columns={[t('shortcuts.code'), t('product'), t('shortcuts.show'), t('shortcuts.order')]}
        rows={items.map((item, index) => {
          const id = item.storeProductId;
          const toggle = (
            <Switch
              label={t('shortcuts.show')}
              checked={item.showInQuickPick}
              disabled={!editable || (!item.isEligible && !item.showInQuickPick)}
              onChange={(show) => editor.toggle(id, show)}
            />
          );
          const order = (
            <div className="flex gap-2">
              <IconButton
                icon="chevron-up"
                label={t('shortcuts.up')}
                disabled={!editable || index === 0}
                onClick={() => editor.move(id, -1)}
              />
              <IconButton
                icon="chevron-down"
                label={t('shortcuts.down')}
                disabled={!editable || index === items.length - 1}
                onClick={() => editor.move(id, 1)}
              />
              <IconButton
                icon="trash"
                label={t('shortcuts.remove')}
                disabled={!editable}
                onClick={() => editor.remove(id)}
              />
            </div>
          );
          const title = (
            <div
              draggable={editable}
              onDragStart={() => {
                drag.current = id;
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (drag.current) editor.drop(drag.current, id);
                drag.current = null;
              }}
            >
              {item.title}
            </div>
          );
          return {
            id,
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
  );
}
