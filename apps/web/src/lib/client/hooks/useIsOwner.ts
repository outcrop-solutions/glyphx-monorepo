'use client';
import {isTeamOwner} from 'actions';
import {useParams} from 'next/navigation';
import {useEffect, useState} from 'react';

const useIsTeamOwner = () => {
  const params = useParams();
  const {workspaceId} = params as {workspaceId: string};
  const [data, setData] = useState<null | {isTeamOwner: boolean; inviteLink: string; error?: undefined}>(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const isTeamOwnerData = async (id) => {
      const retval = await isTeamOwner(id);
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
      isTeamOwnerData(workspaceId);
    }
  }, [workspaceId]);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useIsTeamOwner;
