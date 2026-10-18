/** One package row of the units step as typed (raw text kept for Back and refresh). */
export type PackRow = {
  readonly name: string;
  readonly baseQty: string;
  readonly barcode?: string;
  readonly isSellable?: boolean;
  readonly isPurchasable?: boolean;
};

export type PackRowError = 'name' | 'duplicate' | 'quantity' | 'barcode' | 'uses';
