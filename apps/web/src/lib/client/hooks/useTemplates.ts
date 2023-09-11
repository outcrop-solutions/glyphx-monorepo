'use client';
import useSWR from 'swr';

const useTemplates = () => {
  const apiRoute = `/api/template/get`;
  const {data, error} = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useTemplates;
