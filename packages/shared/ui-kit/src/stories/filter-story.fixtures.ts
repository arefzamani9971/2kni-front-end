export type ProductFilter = { q: string; categoryId: string; inStock: boolean };

/** Use-case defaults: «بازنشانی» returns here (not to all-empty). */
export const DEFAULT_PRODUCT_FILTER: ProductFilter = { q: '', categoryId: '', inStock: false };

export const CATEGORY_OPTIONS = [
  { value: 'pens', label: 'نوشت‌افزار' },
  { value: 'paper', label: 'کاغذ و دفتر' },
  { value: 'art', label: 'لوازم هنری' },
];
