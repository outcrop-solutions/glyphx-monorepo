'use client';
import {useCallback, useMemo, useRef} from 'react';
import {debounce} from 'lodash';
import {DraggableHeaderRenderer} from './DraggableHeaderRenderer';
import dynamic from 'next/dynamic';
import {useRecoilValue} from 'recoil';
import {rowIdsAtom} from 'state';
import useDataGrid from 'lib/client/hooks/useDataGrid';
import LoadingBar from 'app/_components/Loaders/LoadingBar';
import 'react-data-grid/lib/styles.css';

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
  // check scroll direction
  // @ts-ignore
  if (event?.scrollDirection !== 'downwards') {
    return false;
  } else if (event?.scrollDirection === 'downwards' && event?.rowOverscanEndIdx >= offset - 10) {
    return true;
  } else {
    return false;
  }
}

export const Datagrid = () => {
  const rowIds = useRecoilValue(rowIdsAtom);
  const ref = useRef(null);
  const {data, offset, setPageNumber, setPageSize, isLoading} = useDataGrid(ref);

  // data grid column handling
  const draggableColumns = useMemo(() => {
    function HeaderRenderer(props) {
      return <>{data && <DraggableHeaderRenderer {...props} />}</>;
    }

    return data
      ? data.columns?.map((c) => {
          if (c.key === 'id') return c;
          return {
            ...c,
            // width: 35,
            renderHeaderCell: HeaderRenderer, // Ensure name is defined and is a string or React element
            name: (c.name || 'Unnamed Column') as string,
          };
        })
      : [];
  }, [data]);

  // handle scroll to the bottom
  const handleScroll = useCallback(
    async (event: React.UIEvent<HTMLDivElement>) => {
      if (shouldPaginate(event, isLoading, offset)) {
        setPageNumber((prev) => prev + 1);
        return;
      } else {
        return;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading, setPageNumber]
  );

  const debouncedScroll = debounce((data) => {
    if (typeof rowIds !== 'boolean' && rowIds.length > 0) {
      return;
    } else {
      handleScroll(data);
    }
  }, 100);

  return data.rows?.length > 0 ? (
    <div className="h-full w-full bg-primary-dark-blue" ref={ref}>
      <ReactDataGrid
        onScroll={(e) => debouncedScroll(e)}
        // @ts-ignore
        columns={draggableColumns}
        rows={data.rows}
        rowGetter={(i) => data.rows[i]}
        rowsCount={data.rows?.length}
      />
    </div>
  ) : (
    <div className="h-full w-full flex flex-col justify-center items-center bg-secondary-mignight">
      <h1 className="text-xl font-bold my-4">Loading Data Grid...</h1>
      <LoadingBar />
    </div>
  );
};
