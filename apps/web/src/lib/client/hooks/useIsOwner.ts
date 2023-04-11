import { useRouter } from 'next/router';
import useSWR from 'swr';

const useIsTeamOwner = () => {
  const router = useRouter();
  const { workspaceSlug } = router.query;
  const apiRoute = `/api/workspace/${workspaceSlug}/isTeamOwner`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useIsTeamOwner;
