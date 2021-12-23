import { PlusIcon } from "@heroicons/react/solid";
import { FileTab } from "./FileTab";

export const FileHeader = ({
  selectedFile,
  setSelectedFile,
  fileSystem,
  filesOpen,
  setFilesOpen,
  setDataGrid,
}) => {
  return (
    <div className="w-full h-11 border-b border-gray-600 text-white text-xs flex items-center">
      {filesOpen && filesOpen.length > 0 && (
        <>
          {filesOpen.map((item, idx) => (
            <FileTab
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              item={item}
              filesOpen={filesOpen}
              setFilesOpen={setFilesOpen}
              setDataGrid={setDataGrid}
            />
          ))}
        </>
      )}
      <PlusIcon className="h-5 text-gray-600 mx-2" />
    </div>
  );
};
