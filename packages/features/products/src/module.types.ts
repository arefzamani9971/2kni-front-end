import type { ProductRepository } from './application/ports';
import type { ShortcutDraft } from './domain/shortcut.types';

export type ProductsModule = {
  readonly products: ProductRepository;
  readonly shortcutDrafts: {
    read(storeId: string): Promise<ShortcutDraft | null>;
    write(storeId: string, value: ShortcutDraft): Promise<void>;
  };
};
