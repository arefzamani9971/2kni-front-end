import type { AttachmentFilter } from '../../../domain/catalog-attachment.types';

export const ATTACHMENT_FILTER_DEFAULTS: AttachmentFilter = {
  q: '',
  categoryId: null,
  productTypeId: null,
  onlyNotInMyStore: true,
  onlyStoreType: true,
};
