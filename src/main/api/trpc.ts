import { initTRPC } from '@trpc/server';

export const PYTHON_BACKEND_HOST_NAME = '127.0.0.1:2333';
export const PYTHON_BACKEND_URI = `http://${PYTHON_BACKEND_HOST_NAME}`;

// This needs to be in its own file to avoid circular import issues
export const t = initTRPC.create({ isServer: true });
