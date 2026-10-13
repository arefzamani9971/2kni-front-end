import type { ProductRepository } from './application/ports';
import type { ShortcutDraft } from './domain/shortcut.types';
import type { BarcodeAliases, BarcodeAliasDrafts } from './application/barcode-alias.types';

export type ProductsModule = {
  readonly barcodeAliases: BarcodeAliases;
  readonly barcodeAliasDrafts: BarcodeAliasDrafts;
  readonly products: ProductRepository;
  readonly shortcutDrafts: {
    read(storeId: string): Promise<ShortcutDraft | null>;
    write(storeId: string, value: ShortcutDraft): Promise<void>;
  };
};
