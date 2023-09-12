'use client';
import {useParams} from 'next/navigation';
import useSWR from 'swr';

const useIsTeamOwner = () => {
  const params = useParams();
  const {workspaceId} = params as {workspaceId: string};
  const apiRoute = `/api/workspace/${workspaceId}/isTeamOwner`;
  const {data, error} = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useIsTeamOwner;
