import { z } from 'zod';

export const Status = z.object({
  status: z.enum(['OK', 'ERROR']),
  message: z.string()
});

export type Status = z.infer<typeof Status>;
