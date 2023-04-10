import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { DraggableHeaderRenderer } from './DraggableHeaderRenderer';

import dynamic from 'next/dynamic';
import useDataGrid from 'lib/client/hooks/useDataGrid';
import { dataGridPayloadSelector } from 'state';

const DataGrid = dynamic(() => import('@glyphx/react-data-grid'), {
  ssr: false,
});

export const Datagrid = () => {
  const { workspaceId, projectId, tableName } = useRecoilValue(dataGridPayloadSelector);
  const { data } = useDataGrid(workspaceId, projectId, tableName);

  // data grid column handling
  const draggableColumns = useMemo(() => {
    function HeaderRenderer(props) {
      return <>{data && <DraggableHeaderRenderer {...props} />}</>;
    }

    return data
      ? data.columns?.map((c) => {
          if (c.key === 'id') return c;
          return { ...c, headerRenderer: HeaderRenderer };
        })
      : [];
  }, [data]);

  return (
    data && (
      <DataGrid
        className=""
        headerRowHeight={20}
        rowHeight={20}
        columns={draggableColumns}
        rows={data.rows}
        // sortColumns={sortColumns}
        // onSortColumnsChange={onSortColumnsChange}
      />
    )
  );
};
