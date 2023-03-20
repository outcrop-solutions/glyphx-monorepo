import useSWR from 'swr';

const useWorkspace = (slug) => {
  const apiRoute = `/api/workspace/${slug}`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useWorkspace;
