'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Alert, Button, FileUploadField, IconButton, FormScene, Section } from '@dukani/ui-kit';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { useImageUploads } from '../hooks/use-image-uploads';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import { newUuid } from '@dukani/domain';
import { EntryShell } from './EntryShell';
import { ImageEditor } from './ImageEditor';
import type { EntryImage } from './EntryImages.types';
export function EntryImages({
  draft,
  save,
  onClose,
}: {
  draft: EntryDraft;
  save: (u: (d: EntryDraft) => EntryDraft) => Promise<EntryDraft | null>;
  onClose: () => void;
}) {
  const t = useEntryTranslations();
  const { images, setImages, upload, change, fileState } = useImageUploads(draft.newItem?.images ?? []);
  const [failedSave, setFailedSave] = useState(false);
  const [editing, setEditing] = useState<EntryImage | null>(null);
  const latest = useRef(images);
  useLayoutEffect(() => {
    latest.current = images;
  }, [images]);
  useEffect(() => {
    void save((d) => ({
      ...d,
      newItem: {
        ...d.newItem!,
        images,
        imageFileIds: [...images]
          .sort((a, b) => Number(!!b.primary) - Number(!!a.primary))
          .flatMap((i) => (i.fileId ? [i.fileId] : [])),
      },
    })).catch(() => setFailedSave(true));
  }, [images, save]);
  const persist = async (close: boolean) => {
    setFailedSave(false);
    try {
      const ordered = [...latest.current].sort((a, b) => Number(!!b.primary) - Number(!!a.primary));
      const result = await save((d) => ({
        ...d,
        newItem: {
          ...d.newItem!,
          images: ordered,
          imageFileIds: ordered.flatMap((i) => (i.fileId ? [i.fileId] : [])),
        },
      }));
      if (!result) throw new Error('DRAFT_SAVE_FAILED');
      if (close) onClose();
    } catch {
      setFailedSave(true);
    }
  };
  const move = (index: number, offset: number) =>
    setImages((current) => {
      const next = [...current];
      const target = index + offset;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  return (
    <EntryShell
      title={t('optionalImages')}
      back={onClose}
      actions={
        <>
          <Button block disabled={images.some((i) => !i.fileId)} onClick={() => void persist(true)}>
            {t('images.save')}
          </Button>
          <Button block variant="secondary" onClick={() => void persist(false)}>
            {t('images.saveDraft')}
          </Button>
        </>
      }
    >
      <Section title={t('optionalImages')}>
        <FileUploadField
          label={t('optionalImages')}
          images
          value={images}
          onChange={change}
          accept="image/jpeg,image/png,image/webp"
          maxFiles={8}
          maxSizeMb={10}
          fileState={fileState}
        />
        {images.map((image, index) => (
          <div key={image.id} className="flex items-center gap-2">
            <span className="text-body-s flex-1">{image.file.name}</span>
            <IconButton icon="edit" label={t('images.edit')} onClick={() => setEditing(image)} />
            <IconButton
              icon="chevron-up"
              label={t('images.moveUp')}
              disabled={index === 0}
              onClick={() => move(index, -1)}
            />
            <IconButton
              icon="chevron-down"
              label={t('images.moveDown')}
              disabled={index === images.length - 1}
              onClick={() => move(index, 1)}
            />
          </div>
        ))}
      </Section>
      <FormScene
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        title={t('images.edit')}
      >
        {editing ? (
          <ImageEditor
            file={editing.file}
            onCancel={() => setEditing(null)}
            onApply={(file) => {
              const replacement = { id: newUuid(), file, primary: editing.primary };
              setImages((current) => current.map((i) => (i.id === editing.id ? replacement : i)));
              setEditing(null);
              void upload(replacement);
            }}
          />
        ) : null}
      </FormScene>
      <Alert tone="info" title={t('images.privateHint')} />
      {failedSave ? <Alert tone="danger" title={t('submitFailed')} /> : null}
    </EntryShell>
  );
}
