import { useDropzone } from 'react-dropzone';
import { PlusIcon } from '@heroicons/react/solid';
import { useFileSystem } from 'services/useFileSystem';

export const MainDropzone = () => {
  const { onDrop } = useFileSystem();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ['.csv', 'application/vnd.ms-excel', 'text/csv', 'text/plain'],
    multiple: true,
  });

  return (
    <div {...getRootProps()} className="text-center h-full flex flex-col justify-center">
      <svg
        className="mx-auto h-12 w-12 text-gray"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
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
