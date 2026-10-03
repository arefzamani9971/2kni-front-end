import type { Dto } from '@dukani/contracts';
import seed from '../seed/dukani-seed-v1.json';
import { seedId } from './ids';
import type { BrandRecord, CategoryRecord } from './reference.types';

export const data = seed.data;

/** Reference data built from the backend seed (`seed/dukani-seed-v1.json`) with stable ids. */
export const storeTypes: Dto<'StoreTypeDto'>[] = data.store_types.map((t) => ({
  id: seedId(`st:${t.seed_key}`),
  key: t.seed_key,
  name: t.name_fa,
}));

export const categories: CategoryRecord[] = data.categories.map((c) => ({
  id: seedId(`cat:${c.seed_key}`),
  key: c.seed_key,
  parentId: c.parent_key ? seedId(`cat:${c.parent_key}`) : null,
  name: c.name_fa,
  sort: c.sort,
}));

/** Category ids visible to each store type. */
export const categoriesByStoreType = new Map<string, Set<string>>();

export const seedBrands: BrandRecord[] = data.brands.map((b) => ({
  id: seedId(`brand:${b.seed_key}`),
  name: b.name_fa,
  nameEn: b.name_en || null,
  status: 'Public',
  storeTypeId: b.store_type_key ? seedId(`st:${b.store_type_key}`) : null,
}));

// --- attributes (product type schema) -------------------------------------------------

export const DATA_TYPES: Record<string, Dto<'AttributeDataType'>> = {
  text: 'Text',
  number: 'Number',
  option: 'Option',
  multi_option: 'MultiOption',
  bool: 'Bool',
};
