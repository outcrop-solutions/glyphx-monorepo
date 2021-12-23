import { XIcon } from "@heroicons/react/solid";
export const FileTab = ({
  item,
  filesOpen,
  setFilesOpen,
  setDataGrid,
  selectedFile,
  setSelectedFile,
}) => {
  // TODO: handle case if transitioning from n to n-1 filesOpen where n-1 !== 0
  const handleClose = () => {
    setFilesOpen((prev) => {
      let newData = prev.filter((el) => el !== item);
      return newData;
    });
    setDataGrid({ rows: [], columns: [] })
  };
  return (
    <div className="flex relative cursor-pointer group hover:bg-gray-600 items-center border-r border-r-gray-600 h-full px-4">
      <span className="text-yellow-500 mr-2 text-xs font-bold">CSV</span>
      {item}
      <div className="rounded-full bg-gray-500 hidden group-hover:flex h-4 absolute right-0 mr-2 z-60">
        <XIcon onClick={handleClose} />
      </div>
    </div>
  );
};
