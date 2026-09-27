import type { HttpHandler } from 'msw';
import type { MockDb } from '../db/mock-db';
import { catalogHandlers } from './catalog';
import { fileHandlers } from './files';
import { identityHandlers } from './identity';
import { productHandlers } from './products';
import { purchasingHandlers } from './purchasing';
import { reportHandlers } from './reports';
import { storeHandlers } from './stores';

/** Every mocked backend module, in the order of the backend's modules. */
export const createHandlers = (db: MockDb): HttpHandler[] => [
  ...identityHandlers(db),
  ...storeHandlers(db),
  ...catalogHandlers(db),
  ...productHandlers(db),
  ...purchasingHandlers(db),
  ...reportHandlers(db),
  ...fileHandlers(db),
];

export { BLOCKED_MOBILE } from './identity';
