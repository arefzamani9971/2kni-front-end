import type { Dto } from '@dukani/contracts';
import { normalizeTitle } from '@dukani/domain';
import seed from '../seed/dukani-seed-v1.json';
import { seedId } from './ids';

type Dimension = Dto<'MeasureDimension'>;
const dim = (d: string): Dimension => (d.charAt(0).toUpperCase() + d.slice(1)) as Dimension;
const data = seed.data;

/** Reference data built from the backend seed (`seed/dukani-seed-v1.json`) with stable ids. */
export const storeTypes: Dto<'StoreTypeDto'>[] = data.store_types.map((t) => ({ id: seedId(`st:${t.seed_key}`), key: t.seed_key, name: t.name_fa }));

export const units: Dto<'UnitDto'>[] = data.units.map((u) => ({
  id: seedId(`unit:${u.seed_key}`),
  key: u.seed_key,
  name: u.name_fa,
  symbol: u.symbol,
  dimension: dim(u.dimension),
  factorToBase: u.factor_to_base,
  maxDecimals: u.max_decimals,
}));

export type CategoryRecord = { id: string; key: string; parentId: string | null; name: string; sort: number };
export const categories: CategoryRecord[] = data.categories.map((c) => ({
  id: seedId(`cat:${c.seed_key}`),
  key: c.seed_key,
  parentId: c.parent_key ? seedId(`cat:${c.parent_key}`) : null,
  name: c.name_fa,
  sort: c.sort,
}));

/** Category ids visible to each store type. */
export const categoriesByStoreType = new Map<string, Set<string>>();
for (const link of data.store_type_categories) {
  const id = seedId(`st:${link.store_type_key}`);
  const set = categoriesByStoreType.get(id) ?? new Set<string>();
  const cat = categories.find((c) => c.key === link.category_key);
  if (cat) {
    set.add(cat.id);
    if (cat.parentId) set.add(cat.parentId);
  }
  categoriesByStoreType.set(id, set);
}

export type ProductTypeRecord = {
  id: string;
  key: string;
  categoryId: string;
  name: string;
  measureDimension: Dimension;
  defaultBaseUnitId: string;
  defaultPackagings: { name: string; baseQty: number }[];
  ownerStoreId: string | null;
};
export const seedProductTypes: ProductTypeRecord[] = data.product_types.map((t) => ({
  id: seedId(`pt:${t.seed_key}`),
  key: t.seed_key,
  categoryId: seedId(`cat:${t.category_key}`),
  name: t.name_fa,
  measureDimension: dim(t.measure_dimension),
  defaultBaseUnitId: seedId(`unit:${t.default_base_unit_key}`),
  defaultPackagings: (t.default_packagings ?? []).map((p) => ({ name: p.name_fa, baseQty: p.base_qty })),
  ownerStoreId: null,
}));

export type BrandRecord = Dto<'BrandDto'> & { storeTypeId: string | null };
export const seedBrands: BrandRecord[] = data.brands.map((b) => ({
  id: seedId(`brand:${b.seed_key}`),
  name: b.name_fa,
  nameEn: b.name_en || null,
  status: 'Public',
  storeTypeId: b.store_type_key ? seedId(`st:${b.store_type_key}`) : null,
}));

export type CatalogUnitRecord = {
  id: string;
  name: string;
  kind: Dto<'UnitKind'>;
  baseQty: number;
  isSellable: boolean;
  isPurchasable: boolean;
  barcodes: { id: string; code: string; kind: Dto<'BarcodeKind'>; isSample: boolean }[];
};

export type CatalogItemRecord = {
  id: string;
  title: string;
  normalizedTitle: string;
  productTypeId: string;
  brandId: string | null;
  brandStatus: Dto<'BrandStatus'>;
  baseUnitId: string;
  netContentValue: number | null;
  netContentUnitId: string | null;
  units: CatalogUnitRecord[];
  imageFileIds: string[];
  description: string | null;
  status: Dto<'CatalogStatus'>;
  origin: Dto<'CatalogOrigin'>;
  ownerStoreId: string | null;
  keyAttributes: string | null;
};

const optionLabel = new Map(data.attribute_options.map((o) => [`${o.attribute_key}:${o.seed_key}`, o.value_fa]));

export const seedCatalogItems: CatalogItemRecord[] = data.catalog_items.map((i) => {
  const units = data.catalog_item_units
    .filter((u) => u.item_key === i.seed_key)
    .map<CatalogUnitRecord>((u) => ({
      id: seedId(`ciu:${i.seed_key}:${u.seed_key}`),
      name: u.name_fa,
      kind: u.kind === 'base' ? 'Base' : 'Package',
      baseQty: u.base_qty,
      isSellable: u.is_sellable,
      isPurchasable: u.is_purchasable,
      barcodes: u.barcode
        ? [{ id: seedId(`bc:${u.barcode}`), code: String(u.barcode), kind: 'Manufacturer', isSample: !!u.is_sample_barcode }]
        : [],
    }));
  const attrs = Object.entries((i.attributes ?? {}) as Record<string, string>)
    .map(([k, v]) => optionLabel.get(`${k}:${v}`))
    .filter(Boolean);
  return {
    id: seedId(`ci:${i.seed_key}`),
    title: i.title,
    normalizedTitle: normalizeTitle(i.title),
    productTypeId: seedId(`pt:${i.product_type_key}`),
    brandId: i.brand_key ? seedId(`brand:${i.brand_key}`) : null,
    brandStatus: i.brand_key ? 'Known' : 'None',
    baseUnitId: seedId(`unit:${i.base_unit_key}`),
    netContentValue: i.net_content_value ?? null,
    netContentUnitId: i.net_content_unit_key ? seedId(`unit:${i.net_content_unit_key}`) : null,
    units,
    imageFileIds: [],
    description: null,
    status: 'Public',
    origin: 'Seed',
    ownerStoreId: null,
    keyAttributes: attrs.length ? attrs.join('، ') : null,
  };
});

export const unitById = (id: string) => units.find((u) => u.id === id);
export const categoryById = (id: string) => categories.find((c) => c.id === id);

// --- attributes (product type schema) -------------------------------------------------

const DATA_TYPES: Record<string, Dto<'AttributeDataType'>> = {
  text: 'Text',
  number: 'Number',
  option: 'Option',
  multi_option: 'MultiOption',
  bool: 'Bool',
};

export const attributeOptions = (attributeKey: string): Dto<'AttributeOptionDto'>[] =>
  data.attribute_options
    .filter((o) => o.attribute_key === attributeKey)
    .sort((a, b) => a.sort - b.sort)
    .map((o) => ({ id: seedId(`ao:${attributeKey}:${o.seed_key}`), key: o.seed_key, value: o.value_fa, colorHex: o.color_hex || null, isArchived: false }));

/** Attribute schema of a seed product type (`GET …/catalog/product-types/{id}` → `attributes`). */
export const productTypeAttributes = (productTypeKey: string): Dto<'ProductTypeAttributeDto'>[] =>
  data.product_type_attributes
    .filter((a) => a.product_type_key === productTypeKey)
    .sort((a, b) => a.sort - b.sort)
    .flatMap((link) => {
      const a = data.attributes.find((x) => x.seed_key === link.attribute_key);
      if (!a) return [];
      return [
        {
          attributeId: seedId(`attr:${a.seed_key}`),
          key: a.seed_key,
          name: a.name_fa,
          dataType: DATA_TYPES[a.data_type] ?? 'Text',
          isRequired: link.is_required,
          isVariantAxis: a.is_variant_axis,
          sort: link.sort,
          options: attributeOptions(a.seed_key),
        },
      ];
    });
