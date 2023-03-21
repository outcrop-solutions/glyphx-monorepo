import useSWR from 'swr';

const useProject = (id) => {
  const apiRoute = `/api/project/${id}`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useProject;
