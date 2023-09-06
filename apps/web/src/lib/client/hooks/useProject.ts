'use client';
import {useParams,useRouter} from 'next/navigation';
import useSWR from 'swr';

const useProject = () => {
  const params = useParams();
  const {projectId} = params as {projectId: string};
  const apiRoute = `/api/project/${projectId}`;
  const {data, error} = useSWR(projectId && `${apiRoute}`, {
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
