import type { StepContext } from './StoreContactStep.types';

/**
 * Copy of the optional steps per host flow. F02 setup is the two-step wizard of Figma 358:481/358:482; in F03 the
 * same screens edit an existing store and save at once (page-contracts storeprofile: «ذخیره اطلاعات»).
 */
export const STEP_COPY: Readonly<
  Record<
    StepContext,
    {
      contactTitle: string;
      contactSave: string;
      privateTitle: string;
      privateSave: string;
      leave: string;
      locationLeave: string;
    }
  >
> = {
  setup: {
    contactTitle: 'تماس و نشانی · ۱ از ۲',
    contactSave: 'ذخیره و ادامه',
    privateTitle: 'مالک و تسویه · ۲ از ۲',
    privateSave: 'ذخیره',
    leave: 'بعداً تکمیل می‌کنم',
    locationLeave: 'ادامه بدون موقعیت',
  },
  edit: {
    contactTitle: 'تماس و نشانی',
    contactSave: 'ذخیره اطلاعات',
    privateTitle: 'مالک و تسویه',
    privateSave: 'ذخیره',
    leave: 'انصراف',
    locationLeave: 'انصراف',
  },
};
