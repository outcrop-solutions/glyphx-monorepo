import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRecoilValue } from 'recoil';
import { filesSelector } from 'state/files';
import { useFileSystem } from 'services/useFileSystem';
import { File } from './File';
import { SidebarDropzone } from './SidebarDropzone';
import FilesIcon from 'public/svg/files-icon.svg';
import UploadIcon from 'public/svg/upload-icon.svg';

export const Files = () => {
  const { onDrop } = useFileSystem();
  const files = useRecoilValue(filesSelector);
  const [isCollapsed, setCollapsed] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ['.csv', 'application/vnd.ms-excel', 'text/csv'],
    multiple: true,
  });

  return (
    <React.Fragment>
      <div className="group">
        <summary className="flex h-8 items-center justify-between w-full text-gray hover:text-white hover:bg-secondary-midnight hover:border-b-white truncate border-b border-gray">
          <div
            onClick={() => {
              setCollapsed(!isCollapsed);
            }}
            className="flex ml-2 items-center"
          >
            <span className="">
              <FilesIcon />
            </span>
            <a>
              <span className="font-roboto font-medium text-[12px] leading-[14px] tracking-[.01em] ml-3 text-light-gray">
                {' '}
                Files{' '}
              </span>
            </a>
          </div>
          <div
            {...getRootProps()}
            className="border-2 border-transparent hover:border-white hover:cursor-pointer rounded-full p-1 mr-1 bg-secondary-space-blue"
          >
            <input {...getInputProps()} />
            <UploadIcon />
          </div>
        </summary>
        <div className={`lg:block py-1 border-b border-gray`}>
          <div>
            {files && files?.length > 0 ? (
              files?.map((file, idx) => <File key={`${file}-${idx}`} fileName={file} idx={idx} />)
            ) : (
              <SidebarDropzone />
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
