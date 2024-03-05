'use client';
import {useRecoilValue} from 'recoil';
import {annotationResourceIdSelector} from 'state/annotations';
import {databaseTypes} from 'types';
import {useEffect, useState} from 'react';
import {getProjectAnnotations, getStateAnnotations} from 'actions/src/annotation';

const useAnnotations = () => {
  const {type, id} = useRecoilValue(annotationResourceIdSelector);
  const [data, setData] = useState<null | databaseTypes.IAnnotation[]>(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getAnnotations = async () => {
      if (type === databaseTypes.constants.ANNOTATION_TYPE.PROJECT) {
        if (id) {
          const pAnnotations = await getProjectAnnotations(id?.toString());
          // @ts-ignore
          if (pAnnotations?.error) {
            // @ts-ignore
            setError(pAnnotations?.error);
          } else if (pAnnotations) {
            // @ts-ignore
            setData(pAnnotations);
          }
        }
      } else {
        if (id) {
          const sAnnotations = await getStateAnnotations(id?.toString());
          // @ts-ignore
          if (sAnnotations?.error) {
            // @ts-ignore
            setError(sAnnotations?.error);
          } else {
            // @ts-ignore
            setData(sAnnotations);
          }
        }
      }
    };
    getAnnotations();
  }, [id, type]);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
    type,
    id,
  };
};

export default useAnnotations;
