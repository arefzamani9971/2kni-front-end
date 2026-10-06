import type { Dto } from '@dukani/contracts';
import type { StoreDetail } from '../application/ports';
import type {
  StoreAddress,
  StoreOpeningHours,
  StorePrivateInfo,
  StoreProfileUpdate,
  StoreType,
  StoreTypeChangePreview,
} from '../domain/store-profile-model.types';

export const storeTypeFromDto = (dto: Dto<'StoreTypeDto'>): StoreType => ({
  id: dto.id,
  key: dto.key,
  name: dto.name,
});

const addressFromDto = (dto: Dto<'AddressDto'>): StoreAddress => ({
  province: dto.province ?? null,
  city: dto.city ?? null,
  line: dto.line ?? null,
  postalCode: dto.postalCode ?? null,
  latitude: dto.latitude ?? null,
  longitude: dto.longitude ?? null,
});

const hoursFromDto = (dto: Dto<'OpeningHoursDto'>): StoreOpeningHours => ({
  day: dto.day,
  opens: dto.opens ?? null,
  closes: dto.closes ?? null,
  closed: dto.closed,
});

export const storeDetailFromDto = (dto: Dto<'StoreDto'>): StoreDetail => ({
  id: dto.id,
  name: dto.name,
  storeTypeKey: dto.storeType.key,
  role: dto.myRole,
  permissions: [...dto.myPermissions],
  profile: {
    id: dto.id,
    name: dto.name,
    storeType: storeTypeFromDto(dto.storeType),
    businessMode: dto.businessMode ?? null,
    phone: dto.phone ?? null,
    email: dto.email ?? null,
    address: dto.address ? addressFromDto(dto.address) : null,
    openingHours: dto.openingHours.map(hoursFromDto),
    logoFileId: dto.logoFileId ?? null,
    logoUrl: dto.logoUrl ?? null,
    version: dto.version,
  },
});

/** Explicit allowlist: UI-only state and read-only fields never enter a write request. */
export const profileUpdateToDto = (value: StoreProfileUpdate): Dto<'UpdateStoreProfileRequest'> => ({
  name: value.name,
  storeTypeId: value.storeTypeId,
  businessMode: value.businessMode,
  phone: value.phone,
  email: value.email,
  address: value.address
    ? {
        province: value.address.province,
        city: value.address.city,
        line: value.address.line,
        postalCode: value.address.postalCode,
        latitude: value.address.latitude,
        longitude: value.address.longitude,
      }
    : null,
  openingHours: value.openingHours.map((h) => ({
    day: h.day,
    opens: h.opens,
    closes: h.closes,
    closed: h.closed,
  })),
  logoFileId: value.logoFileId,
  expectedVersion: value.version,
});

export const privateInfoFromDto = (dto: Dto<'StorePrivateInfoDto'>): StorePrivateInfo => ({
  ownerName: dto.ownerName ?? null,
  nationalId: dto.nationalId ?? null,
  licenseNo: dto.licenseNo ?? null,
  iban: dto.iban ?? null,
  cardNumber: dto.cardNumber ?? null,
  accountNumber: dto.accountNumber ?? null,
  version: dto.version ?? null,
});

export const privateInfoToDto = (value: StorePrivateInfo): Dto<'StorePrivateInfoDto'> => ({
  ownerName: value.ownerName,
  nationalId: value.nationalId,
  licenseNo: value.licenseNo,
  iban: value.iban,
  cardNumber: value.cardNumber,
  accountNumber: value.accountNumber,
  version: value.version,
});

export const typeChangePreviewFromDto = (dto: Dto<'StoreTypeChangePreviewDto'>): StoreTypeChangePreview => ({
  newStoreTypeId: dto.newStoreTypeId,
  productsKept: dto.productsKept,
  categoriesNoLongerSuggested: [...dto.categoriesNoLongerSuggested],
});
