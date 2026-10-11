import type { PickedFile } from './FileUploadField.types';
import type { FileLimits, FileSelectionError } from './file-selection.types';

/** Whether a file matches an `accept` list such as 'image/*,application/pdf'. */
export const acceptsFile = (accept: string, file: File) =>
  accept.split(',').some((a) => {
    const t = a.trim();
    return t.endsWith('/*') ? file.type.startsWith(t.slice(0, -1)) : file.type === t;
  });

/**
 * Adds picked files within the limits. Files of the wrong type or size are skipped; picking stops at
 * `maxFiles`. The last problem met is returned for the field message. In image mode the first file is primary.
 */
export const addFiles = (value: readonly PickedFile[], files: readonly File[], limits: FileLimits) => {
  const next = [...value];
  let error: FileSelectionError | null = null;
  for (const file of files) {
    if (next.length >= limits.maxFiles) {
      error = 'maxFiles';
      break;
    }
    if (!acceptsFile(limits.accept, file)) {
      error = 'type';
      continue;
    }
    if (file.size > limits.maxSizeMb * 1024 * 1024) {
      error = 'size';
      continue;
    }
    next.push({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      primary: limits.images && next.length === 0,
    });
  }
  return { next, error };
};

/** Removes a file; in image mode the first remaining file becomes primary when the primary was removed. */
export const removeFile = (value: readonly PickedFile[], id: string, images?: boolean) => {
  const next = value.filter((f) => f.id !== id);
  if (images && next.length && !next.some((f) => f.primary)) next[0] = { ...next[0]!, primary: true };
  return next;
};
