import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { DraggableHeaderRenderer } from './DraggableHeaderRenderer';
import dynamic from 'next/dynamic';
import useDataGrid from 'lib/client/hooks/useDataGrid';
import { dataGridPayloadSelector } from 'state';
// import DataGrid from 'react-data-grid';
const ReactDataGrid = dynamic(() => import('react-data-grid'), {
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
      <ReactDataGrid
        // @ts-ignore
        columns={draggableColumns}
        rowGetter={(i) => data.rows[i]}
        rowsCount={data.rows.length}
        minHeight={window.innerHeight - 88}
      />
    )
  );

  // return (
  //   data &&
  //   data.rows && (
  //     <ReactDataGrid
  //       // headerRowHeight={20}
  //       // rowHeight={20}
  //       // rowGetter={(i) => data.rows[i]}
  //       columns={draggableColumns}
  //       rows={data.rows}
  //       // sortColumns={sortColumns}
  //       // onSortColumnsChange={onSortColumnsChange}
  //     />
  //   )
  // );
};
