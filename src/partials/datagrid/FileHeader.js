import { PlusIcon, XIcon } from "@heroicons/react/solid";
import { useEffect } from "react";

export const FileHeader = ({fileSystem, filesOpen, setFilesOpen}) => {
  return (
    <div className="w-full h-11 border-b border-gray-600 text-white text-xs flex items-center">
      {fileSystem && fileSystem.length > 0 && (
        <>
          {fileSystem.map((item, idx) => (
            <div className="flex relative cursor-pointer group hover:bg-gray-600 items-center border-r border-r-gray-600 h-full px-4">
              <span className="text-yellow-500 mr-2 text-xs font-bold">
                CSV
              </span>
              {item.text}
              <div className="rounded-full bg-gray-500 hidden group-hover:flex h-4 absolute right-0 mr-2 z-60">
                <XIcon />
              </div>
            </div>
          ))}
        </>
      )}
      <PlusIcon className="h-5 text-gray-600 mx-2" />
    </div>
  );
};
