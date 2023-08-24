import { useRecoilState, useRecoilValue } from 'recoil';
import { selectedFileIndexSelector } from 'state/files';
import { XIcon } from '@heroicons/react/solid';
import { useFileSystem } from 'services/useFileSystem';

export const FileTab = ({ tableName, fileIndex }) => {
  const { closeFile, selectFile } = useFileSystem();
  const selectedFile = useRecoilValue(selectedFileIndexSelector);

  const handleClose = (e) => {
    e.stopPropagation();
    closeFile(fileIndex);
  };
  return (
    <div
      onClick={() => selectFile(fileIndex)}
      className={`flex relative cursor-pointer hover:bg-gray items-center ${
        selectedFile === fileIndex ? 'border border-blue-600' : 'border border-gray'
      } h-full px-4`}
    >
      <span className="text-primary-yellow mr-2 text-[12px] leading-[14px] tracking-[.01em] font-roboto font-medium text-center">
        CSV
      </span>
      <p className="text-light-gray font-roboto font-normal text-[12px] leading-[14px]">{tableName}</p>
      <div className="h-4 w-4 ml-2 border border-transparent rounded-full hover:border-white">
        <XIcon onClick={handleClose} />
      </div>
    </div>
  );
};
