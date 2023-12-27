import { PYTHON_BACKEND_URI, t } from '../trpc';
import { BlockInfo } from '../../../types';
import { z } from 'zod';
import axios from 'axios';

export const blocksRouter = t.router({
  getBlocks: t.procedure.output(z.record(BlockInfo)).query(async () => {
    const res = await axios.get(`${PYTHON_BACKEND_URI}/blocks`);
    return res.data;
  })
});
