import { z } from 'zod';

export const BackendStatus = z.object({
  status: z.enum(['OK', 'ERROR']),
  message: z.string()
});

export type BackendStatus = z.infer<typeof BackendStatus>;

export type SetupStatus = {
  status: 'running' | 'completed' | 'pending' | 'error' | 'warning';
  stage:
    | 'check-python-installation'
    | 'check-pipx-installation'
    | 'install-dependencies'
    | 'spawn-captain';
  message: string;
  percent: number;
};
