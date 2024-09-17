'use client';
import {getProjectLogs} from 'actions';
import {useParams} from 'next/navigation';
import {useEffect, useState} from 'react';

const useProjectLogs = () => {
  const params = useParams();
  const {projectId} = params as {projectId: string};
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(null);
  ` d`;
  useEffect(() => {
    const getProjectLogData = async (id) => {
      const retval = await getProjectLogs(id);
      // @ts-ignore
      if (retval?.error) {
        // @ts-ignore
        setError(retval?.error);
      } else if (retval) {
        // @ts-ignore
        setData(retval);
      }
    };
    if (projectId) {
      getProjectLogData(projectId);
    }
  }, [projectId]);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useProjectLogs;
