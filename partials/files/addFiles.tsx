import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Storage } from "aws-amplify";
import { parse } from "papaparse";
import { formatGridData } from "partials";
import { PlusIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import {
  dataGridAtom,
  filesOpenAtom,
  fileSystemAtom,
  selectedFileAtom,
} from "@/state/files";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { selectedProjectSelector } from "@/state/project";
import { dataGridLoadingAtom } from "@/state/globals";
import { postUploadCall } from "@/services/ETLCalls";

export const AddFiles = () => {
  const { query } = useRouter();
  const { projectId } = query;

  const [fileSystem, setFileSystem] = useRecoilState(fileSystemAtom);
  const setSelectedFile = useSetRecoilState(selectedFileAtom);
  const setFilesOpen = useSetRecoilState(filesOpenAtom);
  const setDataGrid = useSetRecoilState(dataGridAtom);
  const project = useRecoilValue(selectedProjectSelector);

  const [dataGridState, setDataGridState] = useRecoilState(dataGridLoadingAtom);
  const [progress, setProgress] = useState(null);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      setDataGridState(true);
      //update file system state with processed data
      let newData = acceptedFiles.map(({ name, type, size }, idx) => ({
        // @ts-ignore
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

      acceptedFiles.forEach(async (file) => {
        const text = await file.text();
        const { data } = parse(text, { header: true });

        const grid = formatGridData(data);
        setDataGrid(grid);
        setFilesOpen((prev) => [...prev, file.name]);
        setSelectedFile(file.name);
      });

      //send file to s3
      acceptedFiles.forEach((file, idx) => {
        const reader = new FileReader();

        reader.onabort = () => console.log("file reading was aborted");
        reader.onerror = () => console.log("file reading has failed");
        reader.onload = () => {
          // Do whatever you want with the file contents
          const binaryStr = reader.result;

          Storage.put(`${projectId}/input/${file.name}`, binaryStr, {
            async progressCallback(progress) {
              if (progress.loaded / progress.total === 1) {
                console.log("upload complete");
                console.log("about to do api call");
                //api call here
                try {
                  const result = await postUploadCall(project.id);
                  console.log({result});
                  setDataGridState(false);
                } catch (error) {
                  console.log({ error });
                }
              } else {
                console.log("upload incomplete");
              }
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
    [setFileSystem, project, fileSystem, setDataGrid]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "text/csv",
    multiple: false,
  });
  return (
    <div
      {...getRootProps()}
      className="text-center h-full flex flex-col justify-center"
    >
      
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
          <h3 className="mt-2 text-sm font-medium text-white">
            No files loaded...
          </h3>
          <p className="mt-1 text-sm text-gray">
            Add a new CSV file to your project or open an existing file form the
            Files drawer.
          </p>
          <div className="mt-6">
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="text-gray hover:text-slate-300 cursor-pointer m-4">
                Drop the files here ...
              </div>
            ) : (
              <button
                // onClick={()=>{console.log("click")}}
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
