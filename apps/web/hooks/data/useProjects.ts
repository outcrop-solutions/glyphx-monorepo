import useSWR from 'swr';

const useProjects = (slug) => {
  const apiRoute = `/api/${slug}/projects`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useProjects;
