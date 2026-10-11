'use client';
import { useEffect, useRef, useState } from 'react';
import { useActiveStore } from '@dukani/platform';
import type { PickedFile } from '@dukani/ui-kit';
import type { EvidenceFile } from '../../domain/correction.types';
import { useCatalogModule } from '../../module';

/** Uploads each picked evidence file on its own with its own retry; removing a file cancels its upload. */
export function useEvidenceUploads(initial: readonly EvidenceFile[]) {
  const store = useActiveStore();
  const { corrections } = useCatalogModule();
  const [files, setFiles] = useState(initial);
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
  const upload = async (item: EvidenceFile) => {
    if (inFlight.current.has(item.id)) return;
    const controller = new AbortController();
    inFlight.current.set(item.id, controller);
    setStates((s) => ({ ...s, [item.id]: 'uploading' }));
    try {
      const response = await corrections.uploadEvidence(store.id, item.file, controller.signal);
      if (!mounted.current || controller.signal.aborted) return;
      setFiles((current) => current.map((f) => (f.id === item.id ? { ...f, fileId: response.fileId } : f)));
      setStates((s) => ({ ...s, [item.id]: 'done' }));
    } catch {
      if (mounted.current && !controller.signal.aborted) setStates((s) => ({ ...s, [item.id]: 'failed' }));
    } finally {
      inFlight.current.delete(item.id);
    }
  };
  const change = (next: readonly PickedFile[]) => {
    const merged = next.map((f) => ({ ...files.find((old) => old.id === f.id), ...f }));
    files
      .filter((old) => !next.some((f) => f.id === old.id))
      .forEach((old) => inFlight.current.get(old.id)?.abort());
    setFiles(merged);
    merged.filter((f) => !f.fileId).forEach((f) => void upload(f));
  };
  const fileState = (id: string) => ({
    state: states[id] ?? (files.find((f) => f.id === id)?.fileId ? ('done' as const) : ('failed' as const)),
    onRetry: () => {
      const item = files.find((f) => f.id === id);
      if (item) void upload(item);
    },
  });
  return { files, change, fileState, reset: () => setFiles([]) };
}
