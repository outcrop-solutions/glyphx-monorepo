'use client';
import {getMembers} from 'actions';
import {useParams} from 'next/navigation';
import {useEffect, useState} from 'react';

const useMembers = () => {
  const params = useParams();
  const {workspaceSlug} = params as {workspaceSlug: string};
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getMemberData = async (id) => {
      const retval = await getMembers(id);
      // @ts-ignore
      if (retval?.error) {
        // @ts-ignore
        setError(retval?.error);
      } else if (retval) {
        // @ts-ignore
        setData(retval);
      }
    };
    if (workspaceSlug) {
      getMemberData(workspaceSlug);
    }
  }, [workspaceSlug]);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useMembers;
