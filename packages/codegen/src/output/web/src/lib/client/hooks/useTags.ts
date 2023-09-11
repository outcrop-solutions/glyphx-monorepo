// THIS CODE WAS AUTOMATICALLY GENERATED
'use client';
import useSWR from 'swr';

const useTags = () => {
  const apiRoute = `/api/tags`;
  const {data, error} = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useTags;
