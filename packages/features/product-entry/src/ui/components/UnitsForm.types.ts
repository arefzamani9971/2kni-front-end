export type Row = {
  name: string;
  baseQty: string;
  barcode?: string;
  isSellable?: boolean;
  isPurchasable?: boolean;
  error?: 'name' | 'quantity' | 'barcode';
};
