type Primitive = string | number | boolean | bigint | symbol | null | undefined | Date;

/** Dotted path of a form value (`lines.0.quantity`). Library-independent. */
export type FieldPath<T> = T extends Primitive
  ? never
  : T extends readonly (infer U)[]
    ? `${number}` | `${number}.${FieldPath<U>}`
    : { [K in keyof T & string]: T[K] extends Primitive ? K : K | `${K}.${FieldPath<T[K]>}` }[keyof T & string];

export type FieldPathValue<T, P extends string> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? FieldPathValue<T[K], R>
    : T extends readonly (infer U)[]
      ? FieldPathValue<U, R>
      : never
  : P extends keyof T
    ? T[P]
    : T extends readonly (infer U)[]
      ? U
      : never;

/** Array fields of a form value. */
export type ArrayPath<T> = {
  [P in FieldPath<T>]: FieldPathValue<T, P> extends readonly unknown[] ? P : never;
}[FieldPath<T>];
