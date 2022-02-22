import React from "react";
import { Storage } from "aws-amplify";
import { useDragOver } from "@minoru/react-dnd-treeview";
import { TypeIcon } from "./TypeIcon";
import { parse } from "papaparse";
import { formatGridData } from "../../../../partials/actions/Dropzone";
import styles from "./css/CustomNode.module.css";

export const CustomNode = ({
  node,
  depth,
  onToggle,
  isOpen,
  selectedFile,
  openFile,
  selectFile,
}) => {
  const { id, droppable, data } = node;
  const indent = depth * 24;

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggle(node.id);
  };

  const dragOverProps = useDragOver(id, isOpen, onToggle);

  return (
    <div
      onClick={() => {
        if (node.text === selectedFile) {
          selectFile(node.text);
        } else {
          openFile(node.text);
        }
      }}
      className={`tree-node ${
        selectedFile === node.text ? "bg-gray-800" : ""
      } ${styles.root}`}
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
      <div>
        <TypeIcon droppable={droppable} fileType={data?.fileType} />
      </div>
      <div className={styles.labelGridItem}>
        <div className="text-white text-sm truncate">
          {node.text[0] === "_" ? node.text.slice(1) : node.text}
        </div>
      </div>
    </div>
  );
};
