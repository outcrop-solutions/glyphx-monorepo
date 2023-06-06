import { filesOpenSelector } from 'state/files';
import { useRecoilValue } from 'recoil';
import { FileTab } from './FileTab';
import { DownloadIcon } from '@heroicons/react/outline';
import { rowIdsAtom } from 'state';
import { useCallback } from 'react';

const DELIMIT_CHARS = [
  10, //\n
  13, ///LF
  44, //,
];
export const GridHeader = ({ data }) => {
  const filesOpen = useRecoilValue(filesOpenSelector);
  const rowIds = useRecoilValue(rowIdsAtom);
  const isBrowser = !(window && window?.core);

  const exportCsv = useCallback(() => {
    const csvStrings = [];
    const headers = [];
    for (const row of data.rows) {
      const line = [];
      for (const key of Object.keys(row)) {
        let value = String(row[key] || '');
        for (let i = 0; i < value.length; i++) {
          const charValue = value.charCodeAt(i);
          if (DELIMIT_CHARS.includes(charValue)) {
            value = `"${value}"`;
            break;
          }
        }
        line.push(value);
      }
      csvStrings.push(line.join(','));
    }
    for (const col of data.columns) {
      headers.push(String(col.key));
    }
    csvStrings.unshift(headers.join(','));
    window?.core?.SendCsv([...csvStrings].join('\n'));
  }, [data]);

  return (
    <div className="w-full h-8 bg-secondary-space-blue border-b border-gray text-white text-xs flex flex-shrink-0 items-center justify-between">
      {filesOpen && filesOpen?.length > 0 && (
        <>
          {filesOpen.map(({ tableName, fileIndex }, idx) => (
            <FileTab key={`${tableName}-${idx}`} tableName={tableName} fileIndex={fileIndex} />
          ))}
        </>
      )}
      {rowIds && !isBrowser && (
        <div
          onClick={() => exportCsv()}
          className="group cursor-pointer flex items-center justify-between px-4 bg-gray hover:bg-yellow border-r border-t border-l border-white hover:text-black h-full"
        >
          <span>Export CSV</span>
          <DownloadIcon className="text-white w-6 ml-2 group-hover:text-black" />
        </div>
      )}
    </div>
  );
};
