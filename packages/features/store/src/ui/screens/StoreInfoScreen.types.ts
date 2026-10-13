export type StoreInfoScreenProps = {
  readonly storeId: string;
  readonly qrHref?: string;
  /** STORE-05 «ویرایش فروشگاه». */
  readonly editHref: string;
  /** storeprofile «تماس، نشانی و تصویر». */
  readonly contactHref: string;
  /** storelegal «اطلاعات خصوصی مالک و تسویه». */
  readonly privateHref: string;
};

/** Which F03 page the editor opens on; each one saves its own section (F03 §3). */
export type StoreEditEntry = 'edit' | 'contact' | 'private';

export type StoreEditScreenProps = {
  readonly storeId: string;
  readonly entry: StoreEditEntry;
  /** Back / done: returns to STORE-04 (the entry context is kept by the app route). */
  readonly onDone: () => void;
};

/** Views inside the editor route; sub-steps edit the open page's values and return to it. */
export type StoreEditView = 'edit' | 'type' | 'contact' | 'location' | 'hours' | 'private';
