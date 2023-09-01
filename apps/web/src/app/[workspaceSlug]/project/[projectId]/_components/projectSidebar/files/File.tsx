import React, { useCallback } from 'react';
import { selectedFileIndexSelector } from 'state/files';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { webTypes } from 'types';
import { useFileSystem } from 'services/useFileSystem';
import { modalsAtom } from 'state';

import StackedDragHandleIcon from 'public/svg/stacked-drag-handle-icon.svg';
import FileIcon from 'public/svg/file-icon.svg';
import DeleteFileIcon from 'public/svg/delete-file-icon.svg';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

export const File = ({ fileName, idx }) => {
  const { openFile } = useFileSystem();
  const selectedFile = useRecoilValue(selectedFileIndexSelector);
  const setModals = useSetRecoilState(modalsAtom);

  const handleDeleteFile = useCallback(() => {
    setModals(
      produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
        draft.modals.push({
          type: webTypes.constants.MODAL_CONTENT_TYPE.DELETE_FILE,
          isSubmitting: false,
          data: {
            fileName: fileName,
          },
        });
      })
    );
  }, [fileName, setModals]);

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
