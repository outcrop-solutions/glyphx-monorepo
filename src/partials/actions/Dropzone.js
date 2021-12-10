import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Storage } from "aws-amplify";

export const Dropzone = ({ fileSystem, setFileSystem, project, setGrid }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      console.log({ acceptedFiles });
      //   process csv using papaparse
      //	set grid data with processed data
      // pass simplified array of names to files state
      // onclick of file node download data and display in grid
      let newData = acceptedFiles.map(({ name, type, size }, idx) => ({
        id: idx + fileSystem.length + 1,
        parent: 0,
        droppable: false,
        text: name,
        data: {
          fileType: type,
          fileSize: size,
        },
      }));
      setFileSystem(newData);
      //send file to s3
      acceptedFiles.forEach((file, idx) => {
        const reader = new FileReader();

        reader.onabort = () => console.log("file reading was aborted");
        reader.onerror = () => console.log("file reading has failed");
        reader.onload = () => {
          // Do whatever you want with the file contents
          const binaryStr = reader.result;
          console.log({ project });
          Storage.put(`${project.id}/input/${file.name}`, binaryStr, {
            progressCallback(progress) {
              console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
            },
          });
          console.log(`sent ${file.name} to S3`);
        };
        reader.readAsArrayBuffer(file);
      });

      // add to filesystem state
      // upload files to S3
    },
    [setFileSystem, project, fileSystem]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accepts: "text/csv",
    multiple: false,
  });

  return (
    <div
      className={`px-4 py-2 mr-3 ${
        isDragActive ? "border border-white py-0 px-0 h-48" : ""
      } rounded-lg`}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <div className="text-gray-500 hover:text-gray-300 cursor-pointer">
          Drop the files here ...
        </div>
      ) : (
        <div className="text-xs cursor-pointer">
          <span className="text-gray-500 hover:text-gray-300 ">+ Files...</span>
        </div>
      )}
    </div>
  );
};
