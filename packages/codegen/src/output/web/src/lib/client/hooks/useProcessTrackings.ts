// THIS CODE WAS AUTOMATICALLY GENERATED
'use client';
import useSWR from 'swr';

const useProcessTrackings = () => {
  const apiRoute = `/api/processTrackings`;
  const {data, error} = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useProcessTrackings;
