import React, { useState } from "react";
import { Tree } from "@minoru/react-dnd-treeview";
import { CustomNode } from "./CustomNode";
import { CustomDragPreview } from "./CustomDragPreview";
import styles from "./css/Sidebar.module.css";
import { Dropzone } from "partials";
import { PlusIcon } from "@heroicons/react/outline";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { fileSystemAtom } from "@/state/files";

export const Files = ({ toastRef }) => {
  const setFiles = useSetRecoilState(fileSystemAtom);
  const fileSystem = useRecoilValue(fileSystemAtom);
  const handleDrop = (newTree) => setFiles(newTree);
  return (
    <React.Fragment>
      <div className="group">
        <summary className="flex h-11 items-center justify-between w-full text-gray hover:text-white hover:bg-secondary-midnight truncate border-b border-gray">
          <div className="flex ml-2 items-center">
            <span className="transition text-gray  duration-300 shrink-0 group-open:-rotate-180">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill="#CECECE"
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <a>
              <span className="text-sm ml-3 text-white"> Files </span>
            </a>
          </div>
          {/* <PlusIcon className="w-5 h-5 opacity-75 mr-1" /> */}
          <div className="border-2 border-transparent hover:border-white hover:cursor-pointer rounded-full p-1 mr-1 bg-secondary-space-blue">
          <svg className="w-4 h-4" width="5" height="5" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.57143 9.10713H6.42857C6.82143 9.10713 7.14286 8.78168 7.14286 8.38391V4.76782H8.27857C8.91429 4.76782 9.23571 3.98674 8.78571 3.53111L5.50714 0.211541C5.22857 -0.0705138 4.77857 -0.0705138 4.5 0.211541L1.22143 3.53111C0.771429 3.98674 1.08571 4.76782 1.72143 4.76782H2.85714V8.38391C2.85714 8.78168 3.17857 9.10713 3.57143 9.10713ZM0.714286 10.5536H9.28571C9.67857 10.5536 10 10.879 10 11.2768C10 11.6746 9.67857 12 9.28571 12H0.714286C0.321429 12 0 11.6746 0 11.2768C0 10.879 0.321429 10.5536 0.714286 10.5536Z" fill="#CECECE" />
          </svg>
          </div>
          

        </summary>
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
              ) : null
            }
            <Dropzone toastRef={toastRef} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
