import { createEntrySelectionStore } from './infrastructure/entry-selection-store';
import { createCorrectionDraftStore } from './infrastructure/correction-draft-store';
import { createBulkDrafts } from './infrastructure/bulk-draft-repository';
import type { Api } from '@dukani/http';
import {
  createModuleContext,
  browserFlowAnalytics,
  type FlowAnalytics,
  type DraftStore,
} from '@dukani/platform';

import { createEntryDrafts } from './infrastructure/entry-draft-repository';
import { createHttpEntryCatalog, createHttpEntryCommands } from './infrastructure/http-entry-api';
import type { ProductEntryModule } from './module.types';
import { createBarcodeCaptureStore } from './infrastructure/barcode-capture-store';

export const createProductEntryModule = (deps: {
  api: Api;
  drafts: DraftStore;
  userId: () => string;
  analytics?: FlowAnalytics;
}): ProductEntryModule => ({
  analytics: deps.analytics ?? browserFlowAnalytics,
  corrections: createCorrectionDraftStore(deps.drafts, deps.userId),
  selections: createEntrySelectionStore(deps.drafts, deps.userId),
  bulkDrafts: createBulkDrafts(deps.drafts, deps.userId),
  capture: createBarcodeCaptureStore(deps.drafts, deps.userId),
  catalog: createHttpEntryCatalog(deps.api),
  commands: createHttpEntryCommands(deps.api),
  drafts: createEntryDrafts(deps.drafts, deps.userId),
});

export const [ProductEntryModuleProvider, useProductEntryModule] =
  createModuleContext<ProductEntryModule>('product-entry');
