export type CatalogEditorStore = {
  read<T>(storeId: string, id: string): Promise<T | null>;
  write<T>(storeId: string, id: string, value: T): Promise<void>;
  remove(storeId: string, id: string): Promise<void>;
};
