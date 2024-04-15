'use client';
import {getConfigs} from 'actions';
import {useParams} from 'next/navigation';
import {useEffect, useState} from 'react';
import {databaseTypes} from 'types';

const useConfigs = () => {
  const params = useParams();
  const {workspaceId} = params as {workspaceId: string};
  const [data, setData] = useState<null | databaseTypes.IModelConfig[]>(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getConfigsData = async (id) => {
      const retval = await getConfigs();
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
      getConfigsData(workspaceId);
    }
  }, [workspaceId]);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useConfigs;
