import type { Api } from '@dukani/http';
import { createModuleContext } from '@dukani/platform';
import type { ReportsRepository } from './application/ports';
import { createHttpReportsRepository } from './infrastructure/http-reports-repository';

export type ReportsModule = { readonly reports: ReportsRepository };

export const createReportsModule = (deps: { api: Api }): ReportsModule => ({ reports: createHttpReportsRepository(deps.api) });

export const [ReportsModuleProvider, useReportsModule] = createModuleContext<ReportsModule>('reports');
