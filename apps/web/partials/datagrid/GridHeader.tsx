import { useEffect } from 'react';
import { filesOpenSelector } from 'state/files';
import { useRecoilValue } from 'recoil';
import { FileTab } from './FileTab';
// import { PlusIcon } from "@heroicons/react/solid";

export const GridHeader = () => {
  const filesOpen = useRecoilValue(filesOpenSelector);

  return (
    <div className="w-full h-8 bg-secondary-space-blue border-b border-gray text-white text-xs flex flex-shrink-0 items-center">
      {filesOpen && filesOpen.length > 0 && (
        <>
          {filesOpen.map(({tableName, fileIndex}, idx) => (
            <FileTab key={`${tableName}-${idx}`} tableName={tableName} fileIndex={fileIndex} />
          ))}
        </>
      )}
      {/* <PlusIcon className="h-5 text-gray mx-2" /> */}
    </div>
  );
};
