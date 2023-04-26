import React, { useCallback } from 'react';
import { selectedFileIndexSelector } from 'state/files';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { useFileSystem } from 'services/useFileSystem';

import StackedDragHandleIcon from 'public/svg/stacked-drag-handle-icon.svg';
import FileIcon from 'public/svg/file-icon.svg';
import DeleteFileIcon from 'public/svg/delete-file-icon.svg';
import { showModalAtom } from 'state';
import produce from 'immer';

export const File = ({ fileName, idx }) => {
  const { openFile } = useFileSystem();
  const selectedFile = useRecoilValue(selectedFileIndexSelector);
  const setShowDeleteFileModal = useSetRecoilState(showModalAtom);

  const handleDeleteFile = useCallback(() => {
    setShowDeleteFileModal(
      produce((draft) => {
        draft.type = 'deleteFile';
        draft.data.fileName = fileName;
      })
    );
  }, [fileName, setShowDeleteFileModal]);

  return (
    <div
      className={`group grid items-center ${
        selectedFile == idx ? 'bg-secondary-midnight' : ''
      } gap-x-2 px-2 h-8 grid-cols-12 hover:bg-secondary-midnight`}
    >
      {/* LEADING FILE ICON */}
      <div className="col-span-1">
        <div className="hidden group-hover:flex">
          <StackedDragHandleIcon />
        </div>
        <div className="flex group-hover:hidden">
          <FileIcon />
        </div>
      </div>
      {/* FILE NAME (TRUNCATED) */}
      <div
        onClick={() => {
          openFile(idx);
        }}
        className="truncate col-span-9 text-left cursor-pointer"
      >
        <p className="text-light-gray w-full text-[12px] leading-[14px] font-roboto font-normal truncate pl-1">
          {/* {node.text[0] === "_" ? node.text.slice(1) : node.text} */}
          {fileName}
        </p>
      </div>
      <div
        onClick={handleDeleteFile}
        className="hidden col-span-2 group-hover:flex group-hover:items-center group-hover:justify-center"
      >
        <DeleteFileIcon />
      </div>
    </div>
  );
};
