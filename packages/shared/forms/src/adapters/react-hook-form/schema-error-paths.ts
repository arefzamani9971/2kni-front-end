import type { FieldValues, UseFormReturn } from 'react-hook-form';

/**
 * Paths whose current error comes from the schema (not a manual or server error). Read through `getFieldState`,
 * which uses the control's live state — the host's `formState` snapshot is only fresh for keys it subscribes to.
 */
export function schemaErrorPaths(rhf: UseFormReturn<FieldValues, unknown, FieldValues>): string[] {
  const paths: string[] = [];
  const visit = (value: unknown, path: string) => {
    if (path) {
      const error = rhf.getFieldState(path).error;
      if (error && typeof error.type === 'string' && error.type !== 'manual' && error.type !== 'server')
        paths.push(path);
    }
    if (value && typeof value === 'object')
      for (const [key, child] of Object.entries(value)) visit(child, path ? `${path}.${key}` : key);
  };
  visit(rhf.getValues(), '');
  return paths;
}
