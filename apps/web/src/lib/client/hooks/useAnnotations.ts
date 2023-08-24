'use client';
import { useRecoilValue } from 'recoil';
import { annotationResourceIdSelector } from 'state/annotations';
import { database as databaseTypes } from '@glyphx/types';
import useSWR from 'swr';

const useAnnotations = () => {
  const { type, id } = useRecoilValue(annotationResourceIdSelector);

  const apiRoute =
    type === databaseTypes.constants.ANNOTATION_TYPE.PROJECT
      ? `/api/annotations/project/${id}`
      : `/api/annotations/state/${id}`;

  const { data, error } = useSWR(id && `${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
    type,
    id,
  };
};

export default useAnnotations;
