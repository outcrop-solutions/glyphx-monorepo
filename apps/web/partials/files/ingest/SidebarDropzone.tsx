import React from 'react';
import { useDropzone } from 'react-dropzone';
import { useFileSystem } from '@/services/useFileSystem';

export const SidebarDropzone = () => {
  const { onDrop } = useFileSystem();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ['.csv', 'application/vnd.ms-excel', 'text/csv'],
    multiple: true,
  });

  return (
    <div
      className={`px-4 py-2 mr-3 ${isDragActive ? 'border border-white py-0 px-0 h-48' : ''} rounded-lg`}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <div className="text-white cursor-pointer">Drop the files here ...</div>
      ) : (
        <div className="text-xs cursor-pointer">
          <span className="text-white ">Add files here...</span>
        </div>
      )}
    </div>
  );
};
