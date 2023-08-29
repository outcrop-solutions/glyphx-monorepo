'use client';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

const useIsTeamOwner = () => {
  const params = useParams();
  const { workspaceSlug } = params as { workspaceSlug: string };
  const apiRoute = `/api/workspace/${workspaceSlug}/isTeamOwner`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useIsTeamOwner;
