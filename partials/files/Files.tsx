import React, { useState } from "react";
import { Tree } from "@minoru/react-dnd-treeview";
import { CustomNode } from "./CustomNode";
import { CustomDragPreview } from "./CustomDragPreview";
import styles from "./css/Sidebar.module.css";
import { Dropzone } from "partials";
import { PlusIcon } from "@heroicons/react/outline";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { fileSystemAtom } from "@/state/files";

export const Files = ({ openFile, toastRef }) => {
  const setFiles = useSetRecoilState(fileSystemAtom);
  const fileSystem = useRecoilValue(fileSystemAtom);
  const handleDrop = (newTree) => setFiles(newTree);
  return (
    <React.Fragment>
      <details open className="group">
        <summary className="flex h-11 items-center justify-between w-full text-gray hover:text-white truncate border-b border-gray">
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
          <PlusIcon className="w-5 h-5 opacity-75 mr-1" />
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
                      openFile={openFile}
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
      </details>
    </React.Fragment>
  );
};
