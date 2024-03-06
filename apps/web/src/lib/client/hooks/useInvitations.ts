'use client';
import {getPendingInvitations} from 'actions';
import {useEffect, useState} from 'react';
import {databaseTypes} from 'types';

const useInvitations = () => {
  const [data, setData] = useState<null | databaseTypes.IProject>(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getWorkspaceLogData = async () => {
      const retval = await getPendingInvitations();
      // @ts-ignore
      if (retval?.error) {
        // @ts-ignore
        setError(retval?.error);
      } else if (retval) {
        // @ts-ignore
        setData(retval);
      }
    };

    getWorkspaceLogData();
  }, []);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useInvitations;
