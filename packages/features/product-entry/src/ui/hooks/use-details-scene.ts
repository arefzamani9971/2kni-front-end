'use client';
import { useState } from 'react';
import type { EntryDraft } from '../../domain/entry-draft.types';
import type { DetailsScene } from '../components/NewItemDetails.types';

/** Open part of the details step (main fields, attributes, images) and the per-attribute error marks. */
export function useDetailsScene(draft: EntryDraft) {
  const saved = draft.detailsEditor;
  const [attributesOpen, setAttributesOpen] = useState(saved?.scene === 'attributes');
  const [imagesOpen, setImagesOpen] = useState(saved?.scene === 'images');
  const [expanded, setExpanded] = useState(saved?.expanded ?? false);
  const [attributeErrors, setAttributeErrors] = useState<Record<string, boolean>>({});
  const scene: DetailsScene = imagesOpen ? 'images' : attributesOpen ? 'attributes' : 'main';
  return {
    scene,
    attributesOpen,
    expanded,
    attributeErrors,
    openAttributes: () => {
      setAttributesOpen(true);
      setExpanded(true);
    },
    closeAttributes: () => setAttributesOpen(false),
    openImages: () => setImagesOpen(true),
    closeImages: () => setImagesOpen(false),
    markInvalid: (ids: readonly string[]) => {
      setExpanded(true);
      setAttributeErrors(Object.fromEntries(ids.map((id) => [id, true])));
    },
    clearError: (id: string) => setAttributeErrors((errors) => ({ ...errors, [id]: false })),
    clearErrors: () => setAttributeErrors({}),
  };
}
