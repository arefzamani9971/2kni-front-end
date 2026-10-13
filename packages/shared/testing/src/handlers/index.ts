import type { HttpHandler } from 'msw';
import type { MockDb } from '../db/mock-db.types';
import { catalogHandlers } from './catalog';
import { correctionHandlers } from './corrections';
import { fileHandlers } from './files';
import { identityHandlers } from './identity';
import { productEntryHandlers } from './product-entry';
import { productHandlers } from './products';
import { purchasingHandlers } from './purchasing';
import { reportHandlers } from './reports';
import { storeProfileHandlers } from './store-profile';
import { storeHandlers } from './stores';
import { storeQrHandlers } from './store-qr';
import { barcodeAliasHandlers } from './barcode-aliases';

/** Every mocked backend module, in the order of the backend's modules. */
export const createHandlers = (db: MockDb): HttpHandler[] => [
  ...identityHandlers(db),
  ...storeHandlers(db),
  ...storeQrHandlers(db),
  ...storeProfileHandlers(db),
  ...catalogHandlers(db),
  ...correctionHandlers(db),
  ...productHandlers(db),
  ...barcodeAliasHandlers(db),
  ...productEntryHandlers(db),
  ...purchasingHandlers(db),
  ...reportHandlers(db),
  ...fileHandlers(db),
];

export { BLOCKED_MOBILE, SEND_FAILED_MOBILE } from './identity.constants';
