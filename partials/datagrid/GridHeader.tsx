import { FileTab } from "./FileTab";
// import { PlusIcon } from "@heroicons/react/solid";

export const GridHeader = ({
  selectedFile,
  filesOpen,
  selectFile,
  closeFile,
}) => {
  return (
    <div className="w-full h-11 border-b border-slate-600 text-white text-xs flex items-center">
      {filesOpen && filesOpen.length > 0 && (
        <>
          {filesOpen.map((item, idx) => (
            <FileTab
              key={`${item}-${idx}`}
              item={item}
              selectedFile={selectedFile}
              selectFile={selectFile}
              closeFile={closeFile}
            />
          ))}
        </>
      )}
      {/* <PlusIcon className="h-5 text-slate-600 mx-2" /> */}
    </div>
  );
};
