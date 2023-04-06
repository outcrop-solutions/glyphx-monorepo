import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { fileSystemSelector, projectAtom, selectedFileAtom } from 'state';
import useSWRImmutable from 'swr/immutable';
import { api } from '../network';
import { _getDataGrid } from '../mutations';
import { useRouter } from 'next/router';

const useDataGrid = () => {
  const router = useRouter();
  const { projectId } = router.query;
  const { index } = useRecoilValue(selectedFileAtom);
  const project = useRecoilValue(projectAtom);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async (idx: number) => {
      if (idx === -1) {
        console.log('no selected file');
        setData(null);
      } else {
        console.log('else block');
        api({
          ..._getDataGrid(project.workspace._id as string, projectId as string, project.files[idx]?.tableName),
          onSuccess(data) {
            console.log({ data });
            setData(data);
          },
        });
      }
    };

    fetchData(index);
  }, [index, project, projectId]);

  return { data };
};

export default useDataGrid;
