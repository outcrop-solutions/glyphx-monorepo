import React from 'react';
import { selectedFileAtom } from 'src/state/files';
import { useRecoilValue } from 'recoil';
import { useFileSystem } from '@/services/useFileSystem';

export const File = ({ fileName, idx }) => {
  const { openFile } = useFileSystem();
  const selectedFile = useRecoilValue(selectedFileAtom);

  return (
    <div
      onClick={() => {
        openFile(idx);
      }}
      className={`group grid items-center ${
        selectedFile == idx ? 'bg-secondary-midnight' : ''
      } gap-x-2 px-2 h-8 grid-cols-12 hover:bg-secondary-midnight`}
    >
      {/* LEADING FILE ICON */}
      <div className="col-span-1">
        <svg
          className="hidden group-hover:flex h-5 w-5 rounded-full border border-transparent hover:border-white"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.66667 10H13.3333C13.7 10 14 9.70001 14 9.33334C14 8.96668 13.7 8.66668 13.3333 8.66668H2.66667C2.3 8.66668 2 8.96668 2 9.33334C2 9.70001 2.3 10 2.66667 10ZM2.66667 12.6667H13.3333C13.7 12.6667 14 12.3667 14 12C14 11.6333 13.7 11.3333 13.3333 11.3333H2.66667C2.3 11.3333 2 11.6333 2 12C2 12.3667 2.3 12.6667 2.66667 12.6667ZM2.66667 7.33334H13.3333C13.7 7.33334 14 7.03334 14 6.66668C14 6.30001 13.7 6.00001 13.3333 6.00001H2.66667C2.3 6.00001 2 6.30001 2 6.66668C2 7.03334 2.3 7.33334 2.66667 7.33334ZM2 4.00001C2 4.36668 2.3 4.66668 2.66667 4.66668H13.3333C13.7 4.66668 14 4.36668 14 4.00001C14 3.63334 13.7 3.33334 13.3333 3.33334H2.66667C2.3 3.33334 2 3.63334 2 4.00001Z"
            fill="#CECECE"
          />
        </svg>
        <svg
          className="flex group-hover:hidden w-5"
          width="10"
          height="12"
          viewBox="0 0 10 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.25 0H1.25C0.5625 0 0.00625014 0.54 0.00625014 1.2L0 10.8C0 11.46 0.55625 12 1.24375 12H8.75C9.4375 12 10 11.46 10 10.8V3.6L6.25 0ZM1.25 10.8V1.2H5.625V4.2H8.75V10.8H1.25Z"
            fill="#CECECE"
          />
        </svg>
      </div>
      {/* FILE NAME (TRUNCATED) */}
      <div className="truncate col-span-9 text-left">
        <p className="text-light-gray w-full text-[12px] leading-[14px] font-roboto font-normal truncate pl-1">
          {/* {node.text[0] === "_" ? node.text.slice(1) : node.text} */}
          {fileName}
        </p>
      </div>
      <svg
        className="col-span-1 h-5 w-5 hidden group-hover:flex rounded-full border border-transparent hover:border-white"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.16667 12.6667C4.16667 13.4 4.76667 14 5.5 14H10.8333C11.5667 14 12.1667 13.4 12.1667 12.6667V6C12.1667 5.26667 11.5667 4.66667 10.8333 4.66667H5.5C4.76667 4.66667 4.16667 5.26667 4.16667 6V12.6667ZM6.16667 6H10.1667C10.5333 6 10.8333 6.3 10.8333 6.66667V12C10.8333 12.3667 10.5333 12.6667 10.1667 12.6667H6.16667C5.8 12.6667 5.5 12.3667 5.5 12V6.66667C5.5 6.3 5.8 6 6.16667 6ZM10.5 2.66667L10.0267 2.19333C9.90667 2.07333 9.73333 2 9.56 2H6.77333C6.6 2 6.42667 2.07333 6.30667 2.19333L5.83333 2.66667H4.16667C3.8 2.66667 3.5 2.96667 3.5 3.33333C3.5 3.7 3.8 4 4.16667 4H12.1667C12.5333 4 12.8333 3.7 12.8333 3.33333C12.8333 2.96667 12.5333 2.66667 12.1667 2.66667H10.5Z"
          fill="#CECECE"
        />
      </svg>
    </div>
  );
};
