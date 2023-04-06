import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { selectedTableNameSelector } from 'state';
import useSWRImmutable from 'swr/immutable';
import { api } from '../network';
import { _getDataGrid } from '../mutations';
import { useRouter } from 'next/router';

const useDataGrid = (tableName) => {
  const router = useRouter();
  const { workspaceId, projectId } = router.query;
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    api({
      ..._getDataGrid(workspaceId as string, projectId as string, tableName),
      onSuccess(data) {
        setData(data);
      },
    });
  }, [projectId, tableName, workspaceId]);

  useEffect(() => {
    if (!data) {
      fetchData();
    }
  }, [data, fetchData]);

  return { data };
};

export default useDataGrid;
