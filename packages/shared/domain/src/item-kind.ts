import type { ItemKind } from './item-kind.types';

export const tracksStock = (kind: ItemKind): boolean => kind === 'Goods';
