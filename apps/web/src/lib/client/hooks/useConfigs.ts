'use client';
import useSWR from 'swr';

const useConfigs = () => {
  const apiRoute = `/api/configs`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useConfigs;
