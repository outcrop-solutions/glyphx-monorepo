import { useRecoilState, useRecoilValue } from "recoil";
import { selectedFileAtom } from "@/state/files";
import { XIcon } from "@heroicons/react/solid";
import { useFileSystem } from "@/services/useFileSystem";

export const FileTab = ({ item }) => {
  const [selectedFile, setSelectedFile] = useRecoilState(selectedFileAtom);
  const { closeFile } = useFileSystem();
  const handleClose = (e) => {
    e.stopPropagation();
    closeFile(item);
  };
  return (
    <div
      onClick={() => setSelectedFile(item)}
      className={`flex relative cursor-pointer hover:bg-gray items-center ${
        selectedFile === item ? "border border-blue-600" : "border border-gray"
      } h-full px-4`}
    >
      <span className="text-primary-yellow mr-2 text-[12px] leading-[14px] tracking-[.01em] font-roboto font-medium text-center">CSV</span>
      <p className="text-light-gray font-roboto font-normal text-[12px] leading-[14px]">{item.split('.')[0]}</p>
      <div className="h-4 w-4 ml-2">
        <XIcon onClick={handleClose} />
      </div>
    </div>
  );
};
