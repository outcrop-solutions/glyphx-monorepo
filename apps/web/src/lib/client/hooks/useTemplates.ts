'use client';
import {getProjectTemplates} from 'actions';
import {useParams} from 'next/navigation';
import {useEffect, useState} from 'react';

const useTemplates = () => {
  const params = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getTemplatesData = async () => {
      const retval = await getProjectTemplates();
      // @ts-ignore
      if (retval?.error) {
        // @ts-ignore
        setError(retval?.error);
      } else if (retval) {
        // @ts-ignore
        setData(retval);
      }
    };

    getTemplatesData();
  }, []);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useTemplates;
