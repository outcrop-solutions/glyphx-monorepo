import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const useProject = () => {
  const { projectId } = useParams();
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
