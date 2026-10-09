import type { StoreTranslator } from '../i18n/types';
import type { StepContext } from './StoreContactStep.types';

/**
 * Copy of the optional steps per host flow. F02 setup is the two-step wizard of Figma 358:481/358:482; in F03 the
 * same screens edit an existing store and save at once (page-contracts storeprofile: «ذخیره اطلاعات»).
 */
export const createStepCopy = (
  t: StoreTranslator,
): Readonly<
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
> => ({
  setup: {
    contactTitle: t('contactStep'),
    contactSave: t('saveContinue'),
    privateTitle: t('privateStep'),
    privateSave: t('save'),
    leave: t('completeLater'),
    locationLeave: t('withoutLocation'),
  },
  edit: {
    contactTitle: t('contactAddress'),
    contactSave: t('saveInformation'),
    privateTitle: t('ownerSettlement'),
    privateSave: t('save'),
    leave: t('cancel'),
    locationLeave: t('cancel'),
  },
});
