'use client';
import {useParams} from 'next/navigation';
import useSWR from 'swr';

const useWorkspace = () => {
  const params = useParams();
  const {workspaceId} = params as {workspaceId: string};
  const apiRoute = `/api/workspace/${workspaceId}`;
  const {data, error} = useSWR(workspaceId && `${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useWorkspace;
