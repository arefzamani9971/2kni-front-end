/** Router port: features navigate without importing the app's router. */
export type Navigation = {
  push(href: string): void;
  replace(href: string): void;
  back(): void;
};
