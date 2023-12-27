import { trpcReact } from '@/main';

export const useBlocks = () => {
  const { data } = trpcReact.getBlocks.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  return data;
};
