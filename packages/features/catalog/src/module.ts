import type { Api } from '@dukani/http';
import type { DraftStore } from '@dukani/platform';
import { createCommandJournal } from './infrastructure/command-journal';
import { createEditorStore } from './infrastructure/editor-store';
import { createModuleContext } from '@dukani/platform';
import { createHttpCatalog } from './infrastructure/http-catalog';
import type { CatalogModule } from './module.types';
export const createCatalogModule = (deps: {
  api: Api;
  drafts: DraftStore;
  userId: () => string;
}): CatalogModule => ({
  catalog: createHttpCatalog(deps.api),
  journal: createCommandJournal(deps.drafts, deps.userId),
  editors: createEditorStore(deps.drafts, deps.userId),
});
export const [CatalogModuleProvider, useCatalogModule] = createModuleContext<CatalogModule>('catalog');
