import type { Api } from '@dukani/http';
import { createModuleContext } from '@dukani/platform';

import { createHttpReportsRepository } from './infrastructure/http-reports-repository';
import type { ReportsModule } from './module.types';

export const createReportsModule = (deps: { api: Api }): ReportsModule => ({
  reports: createHttpReportsRepository(deps.api),
});

export const [ReportsModuleProvider, useReportsModule] = createModuleContext<ReportsModule>('reports');
