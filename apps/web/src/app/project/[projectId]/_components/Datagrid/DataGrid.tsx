'use client';
import {useCallback, useMemo} from 'react';
import BarLoader from 'react-spinners/BarLoader';
import {debounce} from 'lodash';
import {DraggableHeaderRenderer} from './DraggableHeaderRenderer';
import dynamic from 'next/dynamic';
import {useRecoilValue} from 'recoil';
import {rowIdsAtom} from 'state';
import useDataGrid from 'lib/client/hooks/useDataGrid';

const ReactDataGrid = dynamic(() => import('react-data-grid'), {
  ssr: false,
});

/**
 *
 *  {
 * an example scroll event
 *     "height": 573,
 *     "scrollTop": 1187,
 *     "scrollLeft": 0,
 *     "rowVisibleStartIdx": 34,
 *     "rowVisibleEndIdx": 50,
 *     "rowOverscanStartIdx": 34,
 *     "rowOverscanEndIdx": 50,
 *     "colVisibleStartIdx": 0,
 *     "colVisibleEndIdx": 5,
 *     "colOverscanStartIdx": 0,
 *     "colOverscanEndIdx": 5,
 *     "scrollDirection": "downwards",
 *     "lastFrozenColumnIndex": -1,
 *     "isScrolling": true
 * }
 * @param event
 * @param isLoading
 * @param offset
 * @returns
 */
function shouldPaginate(event, isLoading: boolean, offset: number): boolean {
  console.log({event, inside: true});

  console.log(event, isLoading, offset);
  console.log({paginate: event?.scrollDirection === 'downwards' && event?.rowOverscanEndIdx >= offset - 40});
  // check scroll direction
  // @ts-ignore
  if (event?.scrollDirection !== 'downwards') {
    console.log('direction is upward');
    return false;
  } else if (event?.scrollDirection === 'downwards' && event?.rowOverscanEndIdx >= offset - 10) {
    return true;
  } else {
    return false;
  }
}

export const Datagrid = () => {
  const rowIds = useRecoilValue(rowIdsAtom);
  const {data, offset, setPageNumber, setPageSize, isLoading} = useDataGrid();

  // data grid column handling
  const draggableColumns = useMemo(() => {
    function HeaderRenderer(props) {
      return <>{data && <DraggableHeaderRenderer {...props} />}</>;
    }

    return data
      ? data.columns?.map((c) => {
          if (c.key === 'id') return c;
          return {...c, headerRenderer: HeaderRenderer};
        })
      : [];
  }, [data]);

  // handle scroll to the bottom
  const handleScroll = useCallback(
    async (event: React.UIEvent<HTMLDivElement>) => {
      if (shouldPaginate(event, isLoading, offset)) {
        console.log('increased page number');
        setPageNumber((prev) => prev + 1);
        return;
      } else {
        console.log('did not paginate');
        return;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading, setPageNumber]
  );

  const debouncedScroll = debounce((data) => {
    handleScroll(data);
  }, 100);

  return data.rows.length > 0 ? (
    <ReactDataGrid
      //@ts-ignore
      onScroll={(e) => debouncedScroll(e)}
      columns={draggableColumns}
      rowGetter={(i) => data.rows[i]}
      rowsCount={data.rows.length}
      minHeight={window.innerHeight - 88}
    />
  ) : (
    <div className="h-full w-full flex flex-col justify-center items-center bg-secondary-mignight">
      <h1 className="text-xl font-bold my-4">Loading Data Grid...</h1>
      <BarLoader loading={!data.rows.length} width={400} color={'yellow'} />
    </div>
  );
};
