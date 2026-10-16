'use client';
import { useDuplicateMatch } from '../hooks/use-duplicate-match';
import { CommandOutcome } from './CommandOutcome';
import type { LiveCommandOutcomeProps } from './LiveCommandOutcome.types';

/**
 * `CommandOutcome` that follows the typed name and scope for the duplicate offer (F05 §8, F06-S06). It is a leaf of
 * `form.Value`, so typing re-renders this outcome only, not the whole catalog form (PAT-FORM-01).
 */
export function LiveCommandOutcome<T extends { readonly name: string }>({
  kind,
  code,
  name,
  scope,
  load,
  scopeOf,
  unknown,
  error,
  onRetry,
  onUseDuplicate,
}: LiveCommandOutcomeProps<T>) {
  const duplicate = useDuplicateMatch({ kind, error, code, current: { name, scope }, load, scopeOf });
  return (
    <CommandOutcome
      unknown={unknown}
      onRetry={onRetry}
      duplicateName={duplicate?.name ?? null}
      onUseDuplicate={() => {
        if (duplicate) onUseDuplicate(duplicate);
      }}
      error={error}
    />
  );
}
