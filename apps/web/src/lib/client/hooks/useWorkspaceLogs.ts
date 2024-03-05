'use client';
import {getWorkspaceLogs} from 'actions';
import {useParams} from 'next/navigation';
import {useEffect, useState} from 'react';
import {databaseTypes} from 'types';

const useWorkspaceLogs = () => {
  const params = useParams();
  const {workspaceId} = params as {workspaceId: string};
  const [data, setData] = useState<null | databaseTypes.IProject>(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getWorkspaceLogData = async (id) => {
      const retval = await getWorkspaceLogs(id);
      // @ts-ignore
      if (retval?.error) {
        // @ts-ignore
        setError(retval?.error);
      } else if (retval) {
        // @ts-ignore
        setData(retval);
      }
    };
    if (workspaceId) {
      getWorkspaceLogData(workspaceId);
    }
  }, [workspaceId]);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useWorkspaceLogs;
