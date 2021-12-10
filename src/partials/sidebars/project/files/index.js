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
  sidebarExpanded,
  setSidebarExpanded,
  project,
}) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };
  const { fileSystem, setFiles } = useFileSystem(project);
  //   const [files, setFiles] = useState(fileSystem ? fileSystem : []);
  //   const [length, setLength] = useState(fileSystem ? fileSystem.length : 0);

  //   useEffect(() => {
  //     setLength(Object.keys(fileSystem).length);
  //     setFiles(fileSystem);
  //   }, [fileSystem]);

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
        className={`lg:hidden lg:project-sidebar-expanded:block 2xl:block py-2 ${
          !open && sidebarExpanded
            ? "border-0 -my-2"
            : "border-b border-gray-400"
        }`}
      >
        <div className={`pl-2 ${!open && "hidden"}`}>
          {fileSystem && fileSystem.length > 0 ? (
            <Tree
              initialOpen={true}
              tree={fileSystem}
              rootId={0}
              render={(node, { depth, isOpen, onToggle }) => (
                <CustomNode
                  project={project}
                  setDataGrid={setDataGrid}
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
          ) : null}
          <Dropzone
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
