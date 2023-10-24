'use client';
import {filesOpenSelector} from 'state/files';
import {useRecoilValue} from 'recoil';
import {FileTab} from './FileTab';
import {DownloadIcon} from '@heroicons/react/outline';
import {rowIdsAtom} from 'state';
import {useCallback} from 'react';
import {toCSV} from './to-csv';

export const GridHeader = ({data}) => {
  const filesOpen = useRecoilValue(filesOpenSelector);
  const rowIds = useRecoilValue(rowIdsAtom);

  const exportCsv = useCallback(() => {
    const csv = toCSV(data?.rows, data?.columns?.map(({key}) => key), ',', '"');
    window?.core?.SendCsv(csv);
  }, [data]);

  return (
    <div className="bg-secondary-space-blue h-8 border-b border-gray text-white text-xs flex flex-shrink-0 items-center justify-between">
      <div className="flex items-center w-full h-8">
        {filesOpen && filesOpen?.length > 0 && (
          <>
            {filesOpen.map(({tableName, fileIndex}, idx) => (
              <FileTab key={`${tableName}-${idx}`} tableName={tableName} fileIndex={fileIndex} />
            ))}
          </>
        )}
      </div>
      {rowIds && window && !window?.core && (
        <div
          onClick={() => exportCsv()}
          className="group cursor-pointer flex items-center justify-between px-4 bg-gray hover:bg-yellow border-r border-t border-l border-white hover:text-black h-full"
        >
          <span className="whitespace-nowrap">Export CSV</span>
          <DownloadIcon className="text-white w-6 ml-2 group-hover:text-black" />
        </div>
      )}
    </div>
  );
};
