import React, { useState, useEffect } from "react";
import { Tree } from "@minoru/react-dnd-treeview";
import { CustomNode } from "./CustomNode";
import { CustomDragPreview } from "./CustomDragPreview";
import styles from "./css/Sidebar.module.css";
import { Header } from "./Header";
import { useFileSystem } from "../../../../services/useFileSystem";
import { Dropzone } from "../../../actions/Dropzone";

export const Files = ({
  setDataGrid,
  setDataGridLoading,
  sidebarExpanded,
  setSidebarExpanded,
  project,
  fileSystem,
  setFiles,
  filesOpen,
  setFilesOpen,
  uploaded,
  setUploaded,
  selectedFile,
  setSelectedFile,
}) => {
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  const handleDrop = (newTree) => setFiles(newTree);
  return (
    <React.Fragment>
      <Header
        open={open}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        handleClick={handleClick}
      />
      <div
        className={`lg:hidden lg:project-sidebar-expanded:block py-2 ${
          !open && sidebarExpanded
            ? "border-0 -my-2"
            : "border-b border-gray-400"
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
                  setDataGridLoading={setDataGridLoading}
                  project={project}
                  setDataGrid={setDataGrid}
                  filesOpen={filesOpen}
                  setFilesOpen={setFilesOpen}
                  node={node}
                  depth={depth}
                  isOpen={isOpen}
                  onToggle={onToggle}
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
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
          />
        </div>
      </div>
    </React.Fragment>
  );
};
