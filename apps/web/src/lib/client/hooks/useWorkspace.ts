import { useParams } from 'next/navigation';
import useSWR from 'swr';

const useWorkspace = () => {
  const { workspaceSlug } = useParams();
  const apiRoute = `/api/workspace/${workspaceSlug}`;
  const { data, error } = useSWR(workspaceSlug && `${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useWorkspace;
