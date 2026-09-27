/** Nominal typing: `Brand<string, 'StoreId'>` is not assignable from a plain string. */
export type Brand<T, B extends string> = T & { readonly __brand: B };
