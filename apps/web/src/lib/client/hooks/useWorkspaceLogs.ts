import useSWR from 'swr';

const useWorkspaceLogs = (workspaceId) => {
  const apiRoute = `/api/logs/project/${workspaceId}`;
  const { data, error } = useSWR(workspaceId && `${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useWorkspaceLogs;
