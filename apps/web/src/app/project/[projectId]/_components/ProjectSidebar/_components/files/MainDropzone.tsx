'use client';
import {useDropzone} from 'react-dropzone';
import {PlusIcon} from '@heroicons/react/solid';
import {useFileSystem} from 'services/useFileSystem';
import DropFileIcon from 'public/svg/drop-file-icon.svg';
export const MainDropzone = () => {
  const {onDrop} = useFileSystem();
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: ['.csv', 'application/vnd.ms-excel', 'text/csv', 'text/plain'],
    multiple: true,
  });

  return (
    <div {...getRootProps()} className="text-center h-full flex flex-col justify-center items-center">
      <div className="w-44">
        <DropFileIcon />
      </div>
      <h3 className="mt-2 text-sm font-medium text-white">No files loaded...</h3>
      <p className="mt-1 text-sm text-gray">
        Add a new CSV file to your project or open an existing file form the Files drawer.
      </p>
      <div className="mt-6">
        <input {...getInputProps()} />
        {isDragActive ? (
          <div className="text-gray hover:text-slate-300 cursor-pointer m-4">Drop the files here ...</div>
        ) : (
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow hover:bg-yellow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add CSV
          </button>
        )}
      </div>
    </div>
  );
};
