import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { selectedTableNameSelector } from 'state';
import useSWRImmutable from 'swr/immutable';
const useDataGrid = () => {
  const apiRoute = `/api/data/table1`;
  const { data, error } = useSWRImmutable(`${apiRoute}`, { revalidateOnMount: false });

  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useDataGrid;
