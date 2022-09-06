import { useRecoilState, useRecoilValue } from "recoil";
import { selectedFileAtom } from "@/state/files";
import { XIcon } from "@heroicons/react/solid";

export const FileTab = ({ closeFile, item }) => {
  const [selectedFile, setSelectedFile] = useRecoilState(selectedFileAtom);
  const handleClose = (e) => {
    e.stopPropagation();
    closeFile(item);
  };
  return (
    <div
      onClick={() => setSelectedFile(item)}
      className={`flex relative cursor-pointer hover:bg-slate-600 items-center ${
        selectedFile === item
          ? "border border-blue-600"
          : "border border-slate-600"
      } h-full px-4`}
    >
      <span className="text-yellow-500 mr-2 text-xs font-bold">CSV</span>
      {item[0] === "_" ? item.slice(1) : item}
      <div className="h-4 w-4 ml-2">
        <XIcon onClick={handleClose} />
      </div>
    </div>
  );
};
