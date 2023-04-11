import { useRouter } from 'next/router';
import useSWR from 'swr';

const useProject = () => {
  const router = useRouter();
  const { projectId } = router.query;
  const apiRoute = `/api/project/${projectId}`;
  const { data, error } = useSWR(projectId && `${apiRoute}`, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useProject;
