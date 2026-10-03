import type { ActiveStore } from '@dukani/platform';

export type CreateStoreScreenProps = {
  readonly onCreated: (store: ActiveStore) => void;
  readonly onBack: () => void;
  /** «ثبت بقیه اطلاعات (اختیاری)» → store profile; hidden until the settings feature is mounted. */
  readonly onMoreInfo?: () => void;
};
