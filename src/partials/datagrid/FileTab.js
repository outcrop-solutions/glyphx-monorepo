import { XIcon } from "@heroicons/react/solid";

export const FileTab = ({ selectFile, closeFile, item, selectedFile }) => {
  const handleClose = (e) => {
    e.stopPropagation();
    closeFile(item);
  };
  return (
    <div
      onClick={() => selectFile(item)}
      className={`flex relative cursor-pointer hover:bg-gray-600 items-center ${
        selectedFile === item
          ? "border border-blue-600"
          : "border border-gray-600"
      } h-full px-4`}
    >
      <span className="text-yellow-500 mr-2 text-xs font-bold">CSV</span>
      {item}
      <div className="h-4 w-4 ml-2">
        <XIcon onClick={handleClose} />
      </div>
    </div>
  );
};
