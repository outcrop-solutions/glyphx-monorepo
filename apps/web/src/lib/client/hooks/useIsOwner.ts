import { useParams } from 'next/navigation';
import useSWR from 'swr';

const useIsTeamOwner = () => {
  const { workspaceSlug } = useParams();
  const apiRoute = `/api/workspace/${workspaceSlug}/isTeamOwner`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useIsTeamOwner;
