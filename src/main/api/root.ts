import { baseRouter } from './routes/base';
import { pythonRouter } from './routes/python';

import { t } from './trpc';

export const appRouter = t.mergeRouters(baseRouter, pythonRouter);
