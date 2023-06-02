import { web as webTypes } from '@glyphx/types';
import { useMemo } from 'react';
import BarLoader from 'react-spinners/BarLoader';
import { DraggableHeaderRenderer } from './DraggableHeaderRenderer';
import dynamic from 'next/dynamic';
import { useRecoilValue } from 'recoil';
import { orientationAtom } from 'state';
const ReactDataGrid = dynamic(() => import('react-data-grid'), {
  ssr: false,
});

export const Datagrid = ({ data }) => {
  const orientation = useRecoilValue(orientationAtom);
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

  return data ? (
    <ReactDataGrid
      // @ts-ignore
      columns={draggableColumns}
      rowGetter={(i) => data.rows[i]}
      rowsCount={data.rows.length}
      minHeight={window.innerHeight - 88}
    />
  ) : (
    <div className="h-full w-full flex flex-col justify-center items-center bg-secondary-mignight">
      <h1 className="text-xl font-bold my-4">Loading Data Grid...</h1>
      <BarLoader loading={!data} width={400} color={'yellow'} />
    </div>
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
