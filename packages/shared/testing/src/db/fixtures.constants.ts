import { seedId } from './ids';

/** FIXTURE-01 of the product docs: one owner with the store «نوشت‌افزار آفتاب». */
export const FIXTURE = {
  ownerMobile: '09123456789',
  newUserMobile: '09120000000',
  /** Mock OTP code (also returned as `devCode`, like the backend in Development). */
  otpCode: '123456',
  ownerId: seedId('user:owner'),
  storeId: seedId('store:aftab'),
  storeName: 'نوشت‌افزار آفتاب',
  supplierAlborzId: seedId('supplier:alborz'),
  supplierMehrId: seedId('supplier:mehr'),
} as const;

export const day = 24 * 60 * 60 * 1000;
