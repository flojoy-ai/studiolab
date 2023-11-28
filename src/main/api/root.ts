import { baseRouter } from './routes/base';
import { setupRouter } from './routes/setup';
import { flowchartRouter } from './routes/flowchart';

import { t } from './trpc';

export const appRouter = t.mergeRouters(baseRouter, setupRouter, flowchartRouter);
