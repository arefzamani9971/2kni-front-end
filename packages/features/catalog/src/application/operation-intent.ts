import type { OperationId } from '@dukani/domain';
import type { CommandJournal } from './command-journal.types';
/** Persist before first dispatch. Replays must not overwrite an already stored immutable intent. */
export function createOperationIntent(journal: CommandJournal, storeId: string, id: string) {
  const stored = new Set<OperationId>();
  return async <V>(payload: V, operationId: OperationId, recovered: boolean) => {
    if (stored.has(operationId) || recovered) return;
    await journal.write(storeId, id, { schemaVersion: 1, operationId, payload });
    stored.add(operationId);
  };
}
