'use client';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

const useWorkspace = () => {
  const params = useParams();
  const { workspaceSlug } = params as { workspaceSlug: string };
  const apiRoute = `/api/workspace/${workspaceSlug}`;
  const { data, error } = useSWR(workspaceSlug && `${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useWorkspace;
