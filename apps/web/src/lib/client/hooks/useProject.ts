'use client';
import {getProject} from 'actions';
import {useParams} from 'next/navigation';
import {useEffect, useState} from 'react';
import {databaseTypes} from 'types';

const useProject = () => {
  const params = useParams();
  const {projectId} = params as {projectId: string};
  const [data, setData] = useState<null | databaseTypes.IProject>(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getProjectData = async (id) => {
      const retval = await getProject(id);
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
      getProjectData(projectId);
    }
  }, [projectId]);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useProject;
