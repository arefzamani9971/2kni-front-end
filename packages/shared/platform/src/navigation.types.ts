/** Router port: features navigate without importing the app's router. */
export type Navigation = {
  push(href: string): void;
  replace(href: string): void;
  /**
   * Records the current view in the address without navigating or fetching (list filter, page, sort): reload and
   * Back return to it (PAT-LIST-02 return context).
   */
  replaceUrl(href: string): void;
  back(): void;
};
