import React,{ useCallback, useEffect, useState } from "react";
import { parse } from "papaparse";
import { Tree } from "@minoru/react-dnd-treeview";
import { CustomNode } from "./CustomNode";
import { CustomDragPreview } from "./CustomDragPreview";
import styles from "./css/Sidebar.module.css";
import { Dropzone, formatGridData } from "partials";
import { Storage } from "aws-amplify";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/router";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  dataGridAtom,
  filesOpenAtom,
  fileSystemAtom,
  selectedFileAtom,
} from "@/state/files";
import { dataGridLoadingAtom,GridModalErrorAtom, progressDetailAtom } from "@/state/globals";
import { postUploadCall } from "@/services/ETLCalls";
import { selectedProjectSelector } from "@/state/project";

export const Files = ({ toastRef }) => {
  const setFiles = useSetRecoilState(fileSystemAtom);
  // const fileSystem = useRecoilValue(fileSystemAtom);
  const handleDrop = (newTree) => setFiles(newTree);

  const { query } = useRouter();
  const { projectId } = query;

  const [fileSystem, setFileSystem] = useRecoilState(fileSystemAtom);
  const setSelectedFile = useSetRecoilState(selectedFileAtom);
  const setFilesOpen = useSetRecoilState(filesOpenAtom);
  const setDataGrid = useSetRecoilState(dataGridAtom);
  const setProgress = useSetRecoilState(progressDetailAtom);
  const setGridErrorModal = useSetRecoilState(GridModalErrorAtom);
  const project = useRecoilValue(selectedProjectSelector);

  const setDataGridState = useSetRecoilState(dataGridLoadingAtom);

  const [isCollapsed, setCollapsed] = useState(false);


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
      console.log({fileSystem},{newData});
      setFileSystem([...fileSystem,newData[0]]);

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
          console.log("inside reader.onLOAD")
          Storage.put(`${projectId}/input/${file.name}`, binaryStr, {
            async progressCallback(progress) {
              setProgress(
                {
                  progress:progress.loaded,
                  total:progress.total
                }
                );
                console.log("Inside storage.put")
              if (progress.loaded / progress.total === 1) {
                console.log("upload complete");
                console.log("about to do api call");
                //api call here
                try {
                  const result = await postUploadCall(project.id);
                  console.log({result});
                  if(result.Error){ // if there is an error
                    setGridErrorModal({
                      show:true,
                      title:"Fatal Error",
                      message:"Error Occured When Processing Your Spreadsheet",
                      devError: result.message
                    })
                  }
                  else{
                    // TODO: SAVE FILE NAME TO PROJECT
                    
                  }
                  
                } catch (error) {
                  setGridErrorModal({
                    show:true,
                    title:"Fatal Error",
                    message:"Failed to Call ETL Post File Upload",
                    devError: error.message
                  })
                  console.log({ error });
                  setDataGridState(false);
                }
                setDataGridState(false);
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
    
    // accept: [".csv"],
    accept:[".csv", "application/vnd.ms-excel", "text/csv"],
    multiple: false,
  });

  useEffect(() => {
    // console.log("rerunning files sidebar useeffect")
  }, [fileSystem]);
  
  return (
    <React.Fragment>
      <div  className="group">
        <summary onClick={()=>{setCollapsed(!isCollapsed)}} className="flex h-11 items-center justify-between w-full text-gray hover:text-white hover:bg-secondary-midnight hover:border-b-white truncate border-b border-gray">
          <div className="flex ml-2 items-center">
            <span className="">
              <svg className={`w-5 h-5 ${isCollapsed ? "-rotate-90": "rotate-180"}`} viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill="#CECECE"
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <a>
              <span className="font-roboto font-medium text-[12px] leading-[14px] tracking-[.01em] ml-3 text-light-gray"> Files </span>
            </a>
          </div>
          {/* <PlusIcon className="w-5 h-5 opacity-75 mr-1" /> */}
          
          <div {...getRootProps()} className="border-2 border-transparent hover:border-white hover:cursor-pointer rounded-full p-1 mr-1 bg-secondary-space-blue">
          <input {...getInputProps()} />
          <svg className="w-4 h-4" width="5" height="5" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.57143 9.10713H6.42857C6.82143 9.10713 7.14286 8.78168 7.14286 8.38391V4.76782H8.27857C8.91429 4.76782 9.23571 3.98674 8.78571 3.53111L5.50714 0.211541C5.22857 -0.0705138 4.77857 -0.0705138 4.5 0.211541L1.22143 3.53111C0.771429 3.98674 1.08571 4.76782 1.72143 4.76782H2.85714V8.38391C2.85714 8.78168 3.17857 9.10713 3.57143 9.10713ZM0.714286 10.5536H9.28571C9.67857 10.5536 10 10.879 10 11.2768C10 11.6746 9.67857 12 9.28571 12H0.714286C0.321429 12 0 11.6746 0 11.2768C0 10.879 0.321429 10.5536 0.714286 10.5536Z" fill="#CECECE" />
          </svg>
          </div>
          

        </summary>
        {
            !isCollapsed ?
            <div className={`lg:block py-2 border-b border-gray`}>
          
          <div>
            {
              // @ts-ignore
              fileSystem && fileSystem.length > 0 ? (
                <Tree
                  initialOpen={true}
                  // @ts-ignore
                  tree={fileSystem}
                  rootId={0}
                  render={(node, { depth, isOpen, onToggle }) => (
                    <CustomNode
                      node={node}
                      depth={depth}
                      isOpen={isOpen}
                      onToggle={onToggle}
                    />
                  )}
                  dragPreviewRender={(monitorProps) => (
                    <CustomDragPreview monitorProps={monitorProps} />
                  )}
                  onDrop={handleDrop}
                  classes={{
                    root: styles.treeRoot,
                    draggingSource: styles.draggingSource,
                    dropTarget: styles.dropTarget,
                  }}
                />
              ) : <Dropzone toastRef={toastRef} />
            }
            
            
          </div>
        </div>
            :

            <></>
          }
        
      </div>
    </React.Fragment>
  );
};
