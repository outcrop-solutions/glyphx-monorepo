// THIS CODE WAS AUTOMATICALLY GENERATED
'use client';
import useSWR from 'swr';

const useUsers = () => {
  const apiRoute = `/api/users`;
  const {data, error} = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useUsers;
