// THIS CODE WAS AUTOMATICALLY GENERATED
'use client';
import useSWR from 'swr';

const useActivityLogs = () => {
  const apiRoute = `/api/activityLogs`;
  const {data, error} = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useActivityLogs;
