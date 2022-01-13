import { XIcon } from "@heroicons/react/solid";

export const FileTab = ({ openFile, closeFile, item, selectedFile }) => {
  return (
    <div
      className={`flex relative cursor-pointer group hover:bg-gray-600 items-center ${
        selectedFile === item
          ? "border border-blue-600"
          : "border border-gray-600"
      } h-full px-4`}
    >
      <span onClick={() => openFile(item)} className="text-yellow-500 mr-2 text-xs font-bold">CSV</span>
      {item}
      <div className="rounded-full bg-gray-500 hidden group-hover:flex h-4 absolute right-0 mr-2 z-60">
        <XIcon onClick={() => closeFile(item)} />
      </div>
    </div>
  );
};
