'use client';
import useSWR from 'swr';

const useProjectLogs = (projectId) => {
  const apiRoute = `/api/logs/project/${projectId}`;
  const {data, error} = useSWR(projectId && `${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useProjectLogs;
