export type StockTone = 'neutral' | 'warning' | 'danger';

export type StockFilter = 'Any' | 'Low' | 'Out';

export type CostFilter = 'Any' | 'Unknown';

export type ProductFilter = {
  readonly q: string;
  readonly stock: StockFilter;
  readonly cost: CostFilter;
  readonly kind?: 'Goods' | 'Service';
  readonly status?: ProductStatus;
};

/** A store product is active or archived (F11); archived products keep their history. */
export type ProductStatus = 'Active' | 'Archived';
