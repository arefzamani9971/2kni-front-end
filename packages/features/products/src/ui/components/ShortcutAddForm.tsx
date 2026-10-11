'use client';
import { Button, PageState, Section, SelectField, TextField } from '@dukani/ui-kit';
import type { useShortcutEditor } from '../hooks/use-shortcut-editor';
import { useProductTranslations } from '../i18n/use-product-translations';

/** New shortcut: a unique code for a searched store product not yet configured. */
export function ShortcutAddForm({ editor }: { editor: ReturnType<typeof useShortcutEditor> }) {
  const t = useProductTranslations();
  const { list, editable } = editor;
  return (
    <Section title={t('shortcuts.new')}>
      <TextField
        label={t('shortcuts.code')}
        value={editor.code}
        disabled={!editable}
        maxLength={16}
        onChange={editor.setCode}
        status={editor.invalid ? 'error' : undefined}
        message={
          editor.invalid ? (editor.duplicate ? t('shortcuts.duplicate') : t('shortcuts.invalid')) : undefined
        }
      />
      <TextField label={t('search')} value={editor.query} onChange={editor.setQuery} />
      <SelectField
        label={t('product')}
        value={editor.productId}
        onChange={editor.setProductId}
        options={list.items
          .filter((i) => !editor.items.some((s) => s.storeProductId === i.id))
          .map((i) => ({ value: i.id, label: i.title }))}
        disabled={!editable}
      />
      {list.error ? (
        <PageState kind="error" action={<Button onClick={() => void list.refetch()}>{t('retry')}</Button>} />
      ) : null}
      {list.hasNextPage ? (
        <Button variant="secondary" onClick={() => void list.fetchNextPage()}>
          {t('loadMore')}
        </Button>
      ) : null}
      <Button variant="secondary" disabled={!editable} onClick={() => void editor.add()}>
        {t('shortcuts.add')}
      </Button>
    </Section>
  );
}
