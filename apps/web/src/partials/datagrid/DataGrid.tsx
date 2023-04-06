import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { DraggableHeaderRenderer } from './DraggableHeaderRenderer';

// state
import { columnsSelector, rowsSelector, selectedTableNameSelector } from 'state/files';
import { showShareModalOpenAtom, showInfoDropdownAtom, showNotificationDropdownAtom } from 'state/ui';

import dynamic from 'next/dynamic';
import useDataGrid from 'lib/client/hooks/useDataGrid';

const DataGrid = dynamic(() => import('@glyphx/react-data-grid'), {
  ssr: false,
});

export const Datagrid = () => {
  // const rows = useRecoilValue(rowsSelector);
  // const columns = useRecoilValue(columnsSelector);
  const tableName = useRecoilValue(selectedTableNameSelector);
  const { data } = useDataGrid(tableName);

  const isShareModelOpen = useRecoilValue(showShareModalOpenAtom);
  const isShowInfoOpen = useRecoilValue(showInfoDropdownAtom);
  const isShowNotificationOpen = useRecoilValue(showNotificationDropdownAtom);

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
        className="w-[500px]"
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
