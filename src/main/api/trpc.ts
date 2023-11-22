import { initTRPC } from '@trpc/server';

// This needs to be in its own file to avoid circular import issues
export const t = initTRPC.create({ isServer: true });
