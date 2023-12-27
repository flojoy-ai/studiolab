import { z } from 'zod';

export const BlockInfo = z.object({
  inputs: z.record(z.string()),
  outputs: z.record(z.string())
});

export type BlockInfo = z.infer<typeof BlockInfo>;
