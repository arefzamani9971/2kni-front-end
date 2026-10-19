import type { PackRow, PackRowError } from '../../../domain/pack-rows.types';

export type Row = PackRow & { readonly error?: PackRowError };
