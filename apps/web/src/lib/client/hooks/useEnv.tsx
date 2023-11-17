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
  const isProd = data?.env === 'prod';
  console.log({isProd});
  return {isProd, isLoading: !error && !data, isError: error};
};

export default useEnv;
