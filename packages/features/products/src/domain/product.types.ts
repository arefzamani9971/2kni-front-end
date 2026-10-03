export type StockTone = 'neutral' | 'warning' | 'danger';

export type StockFilter = 'Any' | 'Low' | 'Out';

export type CostFilter = 'Any' | 'Unknown';

export type ProductFilter = { readonly q: string; readonly stock: StockFilter; readonly cost: CostFilter };
