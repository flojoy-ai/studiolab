import { baseRouter } from './routes/base';
import { pythonRouter } from './routes/python';
import { setupRouter } from './routes/setup';

import { t } from './trpc';

export const appRouter = t.mergeRouters(baseRouter, setupRouter, pythonRouter);
