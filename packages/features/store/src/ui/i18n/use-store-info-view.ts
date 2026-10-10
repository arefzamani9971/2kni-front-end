import type { StoreProfile } from '../../domain/store-profile-model.types';
import type { StoreInfoView } from '../../domain/store-profile.types';
import { openingTimeRange } from '../../domain/store-profile';
import { useStoreTranslations } from './use-store-translations';
import { useStorePresentation } from './use-store-presentation';
export function useStoreInfoView() {
  const t = useStoreTranslations();
  const { digits } = useStorePresentation();
  return (store: StoreProfile): StoreInfoView => {
    const join = (parts: readonly (string | null | undefined)[], separator = ' · ') =>
      parts.filter(Boolean).join(separator) || null;
    const contact = join([store.phone ? digits(store.phone) : null, store.email]);
    const time = openingTimeRange(store.openingHours);
    const hours = time ? t('timeRange', { opens: digits(time.opens), closes: digits(time.closes) }) : null;
    return {
      name: store.name,
      typeName: store.storeType.name,
      businessMode: store.businessMode ? t(`modeTitles.${store.businessMode}`) : null,
      address: join([store.address?.city, store.address?.line], t('listSeparator')),
      contact: contact ? t('contactLine', { contact }) : null,
      postalAndHours: join([
        store.address?.postalCode ? t('postalLine', { code: digits(store.address.postalCode) }) : null,
        hours ? t('hoursLine', { hours }) : null,
      ]),
    };
  };
}
