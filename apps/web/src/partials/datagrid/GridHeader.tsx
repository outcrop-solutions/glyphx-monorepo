import { filesOpenSelector } from 'state/files';
import { useRecoilValue } from 'recoil';
import { FileTab } from './FileTab';
import { CSVLink } from 'react-csv';
import { DownloadIcon } from '@heroicons/react/outline';
import useDataGrid from 'lib/client/hooks/useDataGrid';
// import { PlusIcon } from "@heroicons/react/solid";

export const GridHeader = ({ data }) => {
  const filesOpen = useRecoilValue(filesOpenSelector);

  return (
    <div className="w-full h-8 bg-secondary-space-blue border-b border-gray text-white text-xs flex flex-shrink-0 items-center justify-between">
      {filesOpen && filesOpen?.length > 0 && (
        <>
          {filesOpen.map(({ tableName, fileIndex }, idx) => (
            <FileTab key={`${tableName}-${idx}`} tableName={tableName} fileIndex={fileIndex} />
          ))}
        </>
      )}
      {data?.rows && data?.columns && (
        <CSVLink
          className="group cursor-pointer flex items-center justify-between px-4 bg-gray hover:bg-yellow border-r border-t border-l border-white hover:text-black h-full"
          filename={'data.csv'}
          target="_blank"
          data={data?.rows}
          headers={data?.columns?.map(({ key }) => key)}
        >
          <span>Export CSV</span>
          <DownloadIcon className="text-white w-6 ml-2 group-hover:text-black" />
        </CSVLink>
      )}
      {/* <PlusIcon className="h-5 text-gray mx-2" /> */}
    </div>
  );
};
