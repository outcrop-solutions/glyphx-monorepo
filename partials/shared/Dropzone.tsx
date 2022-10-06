import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Storage } from "aws-amplify";
import { parse } from "papaparse";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  dataGridAtom,
  filesOpenAtom,
  fileSystemAtom,
  selectedFileAtom,
} from "@/state/files";
import { selectedProjectSelector } from "@/state/project";
import { dataGridLoadingAtom,GridModalErrorAtom, progressDetailAtom } from "@/state/globals";
import { postUploadCall } from "@/services/ETLCalls";

export const formatGridData = (data) => {
  const colNames = Object.keys(data[0]);

  let cols = colNames.map((item, idx) => {
    const capitalized = item.charAt(0).toUpperCase() + item.slice(1);
    return {
      key: item,
      dataType: !isNaN(parseInt(data[0][item])) ? "number" : "string",
      name: capitalized,
      resizable: true,
      sortable: true,
    };
  });

  // @ts-ignore
  cols.unshift({ key: "id", name: "", width: 40 });
  let rows = data.map((row, idx) => ({ ...row, id: idx }));
  const newGrid = { columns: cols, rows };

  // add iterator column
  return newGrid;
};

export const Dropzone = ({ toastRef }) => {
  const { query } = useRouter();
  const { projectId } = query;


  const setDataGrid = useSetRecoilState(dataGridAtom);
  const setFilesOpen = useSetRecoilState(filesOpenAtom);
  const setSelectedFile = useSetRecoilState(selectedFileAtom);
  const [fileSystem, setFileSystem] = useRecoilState(fileSystemAtom);
  const selectedProject = useRecoilValue(selectedProjectSelector);
  // status = 'uploading' | 'processing' | 'testing' | 'ready'
  const [status, setStatus] = useState(null);

  const setGridErrorModal = useSetRecoilState(GridModalErrorAtom);
  const setDataGridState = useSetRecoilState(dataGridLoadingAtom);
  const setProgress = useSetRecoilState(progressDetailAtom);

  const handleUpload = useCallback(async (progress) => {
    setStatus("uploading");
    if (progress.loaded / progress.total === 1) {
      let response = await fetch("https://api.glyphx.co/etl-process-new-file", {
        method: "POST",
        mode: "no-cors",
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
    (acceptedFiles) => {
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
        setSelectedFile(file.name);
        setFilesOpen((prev) => [...prev, file.name]);
        setDataGrid(grid);
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
              // handleUpload(progress);
              setProgress(
                {
                  progress:progress.loaded,
                  total:progress.total
                }
                );
              if (progress.loaded / progress.total === 1) {
                toast.done(toastRef.current);
                console.log("about to do api call");
                //api call here
                try {
                  const result = await postUploadCall(selectedProject.id);
                  console.log({result});
                } catch (error) {
                  setGridErrorModal({
                    show:true,
                    title:"Fatal Error",
                    message:"Failed to Call ETL Post File Upload",
                    devError: error.message
                  })
                  console.log({ error });
                }
                setDataGridState(false);
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
    [setFileSystem, selectedProject, fileSystem]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "text/csv",
    multiple: false,
  });

  // FIXME: DROPZONE NOT WORKING. FAILS WHEN FETCHING

  return (
    // <div
    //   className={`px-4 py-2 mr-3 ${
    //     isDragActive ? "border border-white py-0 px-0 h-48" : ""
    //   } rounded-lg`}
    //   {...getRootProps()}
    // >
    //   <input {...getInputProps()} />
    //   {isDragActive ? (
    //     <div className="text-white cursor-pointer">
    //       Drop the files here ...
    //     </div>
    //   ) : (
    //     <div className="text-xs cursor-pointer">
    //       <span className="text-white ">
    //         Add files here...
    //       </span>
    //     </div>
    //   )}
    // </div>
    <></>
  );
};
