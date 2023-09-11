// THIS CODE WAS AUTOMATICALLY GENERATED
'use client';
import useSWR from 'swr';

const useModelConfigs = () => {
  const apiRoute = `/api/modelConfigs`;
  const {data, error} = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useModelConfigs;
