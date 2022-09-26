import React from "react";
import { useDragOver } from "@minoru/react-dnd-treeview";
import { TypeIcon } from "./TypeIcon";
import styles from "./css/CustomNode.module.css";
import { selectedFileAtom } from "@/state/files";
import { useRecoilState } from "recoil";
import { useFileSystem } from "@/services/useFileSystem";

export const CustomNode = ({ node, depth, onToggle, isOpen }) => {
  const { id, droppable, data } = node;
  const indent = depth * 24;
  const { openFile } = useFileSystem();
  const [selectedFile, setSelectedFile] = useRecoilState(selectedFileAtom);

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggle(node.id);
  };

  const dragOverProps = useDragOver(id, isOpen, onToggle);

  return (
    <div
      onClick={() => {
        if (node.text === selectedFile) {
          setSelectedFile(node.text);
        } else {
          openFile(node.text);
        }
      }}
      className={`tree-node ${selectedFile === node.text ? "bg-gray" : ""} ${
        styles.root
      }`}
      style={{ paddingInlineStart: indent }}
      {...dragOverProps}
    >
      <div
        className={`${styles.expandIconWrapper} ${isOpen ? styles.isOpen : ""}`}
      >
        {node.droppable && (
          <div onClick={handleToggle}>
            <svg
              aria-hidden="true"
              role="img"
              width="16"
              height="16"
              viewBox="0 0 20 20"
            >
              <path d="M8 6l6 4.03L8 14V6z" fill="white" />
            </svg>
          </div>
        )}
      </div>
      <div className="mr-2">
        {/* <TypeIcon droppable={droppable} fileType={data?.fileType} /> */}
        <svg
          width="10"
          height="12"
          viewBox="0 0 10 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.25 0H1.25C0.5625 0 0.00625014 0.54 0.00625014 1.2L0 10.8C0 11.46 0.55625 12 1.24375 12H8.75C9.4375 12 10 11.46 10 10.8V3.6L6.25 0ZM1.25 10.8V1.2H5.625V4.2H8.75V10.8H1.25Z"
            fill="#CECECE"
          />
        </svg>
      </div>
      <div className={styles.labelGridItem}>
        <div className="text-white text-sm truncate">
          {node.text[0] === "_" ? node.text.slice(1) : node.text}
        </div>
      </div>
    </div>
  );
};
