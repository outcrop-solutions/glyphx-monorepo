'use client';
import {getWorkspaces} from 'actions';
import {useEffect, useState} from 'react';
import {databaseTypes} from 'types';

const useWorkspaces = () => {
  const [data, setData] = useState<null | databaseTypes.IWorkspace[]>(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getWorkspacesData = async () => {
      const retval = await getWorkspaces();
      // @ts-ignore
      if (retval?.error) {
        // @ts-ignore
        setError(retval?.error);
      } else if (retval) {
        // @ts-ignore
        setData(retval);
      }
    };
    getWorkspacesData();
  }, []);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useWorkspaces;
