'use client';
import { useEffect, useRef, useState } from 'react';
import { useActiveStore } from '@dukani/platform';
import type { PickedFile } from '@dukani/ui-kit';
import { useProductEntryModule } from '../../module';
export type UploadedImage = PickedFile & { readonly fileId?: string };
/** Each file has an independent retry; replacing/removing it cancels its previous upload. */
export function useImageUploads(initial: readonly UploadedImage[]) {
  const store = useActiveStore();
  const { commands } = useProductEntryModule();
  const [images, setImages] = useState(initial);
  const [states, setStates] = useState<Record<string, 'uploading' | 'failed' | 'done'>>({});
  const inFlight = useRef(new Map<string, AbortController>());
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    const uploads = inFlight.current;
    return () => {
      mounted.current = false;
      uploads.forEach((c) => c.abort());
    };
  }, []);
  const upload = async (image: UploadedImage) => {
    if (inFlight.current.has(image.id)) return;
    const controller = new AbortController();
    inFlight.current.set(image.id, controller);
    setStates((s) => ({ ...s, [image.id]: 'uploading' }));
    try {
      const response = await commands.uploadImage(store.id, image.file, controller.signal);
      if (!mounted.current || controller.signal.aborted) return;
      setImages((current) => current.map((i) => (i.id === image.id ? { ...i, fileId: response.fileId } : i)));
      setStates((s) => ({ ...s, [image.id]: 'done' }));
    } catch {
      if (mounted.current && !controller.signal.aborted) setStates((s) => ({ ...s, [image.id]: 'failed' }));
    } finally {
      inFlight.current.delete(image.id);
    }
  };
  const change = (next: readonly PickedFile[]) => {
    const merged = next.map((i) => ({ ...images.find((old) => old.id === i.id), ...i }));
    images
      .filter((old) => !next.some((i) => i.id === old.id))
      .forEach((old) => inFlight.current.get(old.id)?.abort());
    setImages(merged);
    merged.filter((i) => !i.fileId).forEach((i) => void upload(i));
  };
  const fileState = (id: string) => ({
    state: states[id] ?? (images.find((i) => i.id === id)?.fileId ? ('done' as const) : ('failed' as const)),
    onRetry: () => {
      const image = images.find((i) => i.id === id);
      if (image) void upload(image);
    },
  });
  return { images, setImages, upload, change, fileState };
}
