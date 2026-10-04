import type { BusinessMode } from '../../domain/store.types';

/** STORE-05 field values (canonical; null = empty). */
export type StoreEditValues = {
  readonly name: string;
  readonly storeTypeId: string;
  readonly businessMode: BusinessMode | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly addressLine: string | null;
};
