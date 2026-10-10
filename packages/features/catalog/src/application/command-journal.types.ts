import type { OperationId } from '@dukani/domain';
export type CatalogIntent<T> = {
  readonly schemaVersion: 1;
  readonly operationId: OperationId;
  readonly payload: T;
};
export type CommandJournal = {
  read<T>(storeId: string, id: string): Promise<CatalogIntent<T> | null>;
  write<T>(storeId: string, id: string, intent: CatalogIntent<T>): Promise<void>;
  remove(storeId: string, id: string): Promise<void>;
};
