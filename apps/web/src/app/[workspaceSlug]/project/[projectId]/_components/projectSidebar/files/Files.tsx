import React, {useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {useRecoilValue} from 'recoil';
import {filesSelector} from 'state/files';
import {useFileSystem} from 'services/useFileSystem';
import {File} from './File';
import {SidebarDropzone} from './SidebarDropzone';
import {PlusCircleIcon} from '@heroicons/react/outline';

export const Files = () => {
  const {onDrop} = useFileSystem();
  const files = useRecoilValue(filesSelector);
  const [isCollapsed, setCollapsed] = useState(false);

  const {getRootProps, getInputProps} = useDropzone({
    onDrop,
    accept: ['.csv', 'application/vnd.ms-excel', 'text/csv'],
    multiple: true,
  });

  return (
    <React.Fragment>
      <div className="group appearance-none">
        <summary
          onClick={() => {
            setCollapsed(!isCollapsed);
          }}
          className="flex h-8 cursor-pointer items-center justify-between w-full text-gray hover:text-white hover:bg-secondary-midnight hover:border-b-white truncate border-b border-gray appearance-none"
        >
          <div className="flex ml-2 items-center">
            <span className="">
              {/* @jp-burford it's sinful but it's functional for now so*/}
              <svg
                className={`w-5 h-5 ${isCollapsed ? '-rotate-90' : 'rotate-180'}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill="#CECECE"
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
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
            className="w-8 h-8  hover:cursor-pointer rounded-full p-1 mr-1  bg-secondary-space-blue"
          >
            <PlusCircleIcon className="hover:text-white" />
            <input {...getInputProps()} />
          </div>
        </summary>
        {!isCollapsed && (
          <div className={`lg:block py-1 border-b border-gray`}>
            <div>
              {files && files?.length > 0 ? (
                files?.map((file, idx) => <File key={`${file}-${idx}`} fileName={file} idx={idx} />)
              ) : (
                <SidebarDropzone />
              )}
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};
