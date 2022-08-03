import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Storage } from "aws-amplify";
import { parse } from "papaparse";
import { toast } from "react-toastify";

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

  cols.unshift({ key: "id", name: "", width: 40 });
  let rows = data.map((row, idx) => ({ ...row, id: idx }));
  const newGrid = { columns: cols, rows };

  // add iterator column
  return newGrid;
};

export const Dropzone = ({
  setSelectedFile,
  setFilesOpen,
  fileSystem,
  setFileSystem,
  project,
  setDataGrid,
  uploaded,
  setUploaded,
  toastRef,
}) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
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
  
          Storage.put(`${project.id}/input/${file.name}`, binaryStr, {
            async progressCallback(progress) {
              // let prog = progress.loaded / progress.total;
              // if (toastRef.current === null) {
              //   toastRef.current = toast("Upload in Progress", {
              //     position: "bottom-left",
              //     autoClose: 5000,
              //     hideProgressBar: false,
              //     closeOnClick: true,
              //     pauseOnHover: true,
              //     draggable: true,
              //     progress: prog,
              //   });
              // } else {
              //   toast.update(toastRef.current, {
              //     progress: prog,
              //     position: "bottom-left",
              //     autoClose: 5000,
              //     hideProgressBar: false,
              //     closeOnClick: true,
              //     pauseOnHover: true,
              //     draggable: true,
              //   });
              // }
              if (progress.loaded / progress.total === 1) {
                setUploaded(true);
                toast.done(toastRef.current);
                console.log("upload complete");
                console.log("about to do api call")
                //api call here
                try {
                  const result = await fetch(
                    "https://hs02lfxf71.execute-api.us-east-2.amazonaws.com/default/etl-process-new-file-GLUE_API",
                    {
                      method:'post',
                      headers: {'Content-Type':'application/json'},
                      body:JSON.stringify({
                        "model_id": `${project.id}`,
                        "bucket_name": "sampleproject04827-staging"
                      })
                    });
                    console.log({result})
                } catch (error) {
                  console.log({error})
                }
                

              } else {
                console.log("upload incomplete");

                setUploaded(false);
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
    [setFileSystem, project, fileSystem]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "text/csv",
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
          <span className="text-gray-500 hover:text-gray-300 ">
            Add files here...
          </span>
        </div>
      )}
    </div>
  );
};
