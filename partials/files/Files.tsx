import React, { useState } from "react";
import { Tree } from "@minoru/react-dnd-treeview";
import { CustomNode } from "./CustomNode";
import { CustomDragPreview } from "./CustomDragPreview";
import styles from "./css/Sidebar.module.css";
import { FilesHeader } from "./FilesHeader";
import { Dropzone } from "partials";

export const Files = ({
  openFile,
  selectFile,
  setDataGrid,
  sidebarExpanded,
  setSidebarExpanded,
  project,
  fileSystem,
  setFiles,
  setFilesOpen,
  uploaded,
  setUploaded,
  selectedFile,
  setSelectedFile,
  toastRef,
}) => {
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  const handleDrop = (newTree) => setFiles(newTree);
  return (
    <React.Fragment>
      <FilesHeader
        open={open}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        handleClick={handleClick}
      />
      <div
        className={`lg:hidden lg:project-sidebar-expanded:block py-2 ${
          !open && sidebarExpanded
            ? "border-0 -my-2"
            : "border-b border-slate-400"
        }`}
      >
        <div className={`${!open && "hidden"}`}>
          {fileSystem && fileSystem.length > 0 ? (
            <Tree
              initialOpen={true}
              tree={fileSystem}
              rootId={0}
              render={(node, { depth, isOpen, onToggle }) => (
                <CustomNode
                  openFile={openFile}
                  selectFile={selectFile}
                  node={node}
                  depth={depth}
                  isOpen={isOpen}
                  onToggle={onToggle}
                  selectedFile={selectedFile}
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
          ) : null}
          <Dropzone
            setSelectedFile={setSelectedFile}
            setFilesOpen={setFilesOpen}
            uploaded={uploaded}
            setUploaded={setUploaded}
            setDataGrid={setDataGrid}
            project={project}
            fileSystem={fileSystem}
            setFileSystem={setFiles}
            toastRef={toastRef}
          />
        </div>
      </div>
    </React.Fragment>
  );
};
