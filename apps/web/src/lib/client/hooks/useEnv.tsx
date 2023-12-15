import {useSession} from 'next-auth/react';
import useSWR from 'swr';

const useEnv = () => {
  const session = useSession();
  const apiRoute = `/api/env`;
  const {data, error} = useSWR(session && `${apiRoute}`, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {env: data?.env, isLoading: !error && !data, isError: error};
};

export default useEnv;
