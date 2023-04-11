import { useRouter } from 'next/router';
import useSWR from 'swr';

const useWorkspace = () => {
  const router = useRouter();
  const { workspaceSlug } = router.query;
  const apiRoute = `/api/workspace/${workspaceSlug}`;
  const { data, error } = useSWR(workspaceSlug && `${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useWorkspace;
