import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Storage } from "aws-amplify";
import { parse } from "papaparse";
import { formatGridData } from "partials";
import { PlusIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";

export const AddFiles = ({
  fileSystem,
  setFileSystem,
  project,
  setDataGrid,
  setFilesOpen,
  setSelectedFile,
}) => {
  const { query } = useRouter();
  const { projectId } = query;
  // status = 'uploading' | 'processing' | 'testing' | 'ready'
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(null);

  const handleUpload = useCallback(async (progress) => {
    setStatus("uploading");
    if (progress.loaded / progress.total === 1) {
      let response = await fetch("https://api.glyphx.co/etl-process-new-file", {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({
          model_id: projectId,
          bucket_name: "sampleproject04827-staging",
        }),
      });
      console.log({ response });
    }

    // Call process new file API /etl/file
    // setStatus('file uploaded, processing ETL')
    // Call JL's /api-check-crawler with crawlerID
    // setStatus('checking Crawler')
    // Take response and either setAvailable(true/false)
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      //update file system state with processed data
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
            progressCallback(progress) {
              handleUpload(progress);
              if (progress.loaded / progress.total === 1) {
                console.log("upload complete");
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
      {status ? (
        <>
          {" "}
          <div>
            <h2 className="sr-only">Steps</h2>

            <div>
              <p className="text-xs font-medium text-slate-500">
                2/3 - Address
              </p>

              <div className="mt-4 overflow-hidden bg-slate-200 rounded-full">
                <div className="w-2/3 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
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
          <p className="mt-1 text-sm text-slate-200">
            Add a new CSV file to your project or open an existing file form the
            Files drawer.
          </p>
          <div className="mt-6">
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="text-slate-500 hover:text-slate-300 cursor-pointer m-4">
                Drop the files here ...
              </div>
            ) : (
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add CSV
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
