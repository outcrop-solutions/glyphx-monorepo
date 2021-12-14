import { useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";

import SortableHeaderCell from "./SortableHeaderCell";

import { useCombinedRefs } from "../../services/useCombinedRefs";

export function DraggableHeaderRenderer({
  onColumnsReorder,
  column,
  sortDirection,
  onSort,
  priority,
  isCellSelected,
  isDropped,
}) {
  const [{ isDragging }, drag] = useDrag({
    type: "COLUMN_DRAG",
    item: { key: column.key, type: "COLUMN_DRAG", dataType: column.dataType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // useEffect(() => {
  //   if (isDragging) {
  //     setIsEditing((prev) => {
  //       console.log("logging true");
  //       return true;
  //     });
  //   }
  // }, [isDragging, setIsEditing]);

  const [{ isOver }, drop] = useDrop({
    accept: "COLUMN_DRAG",
    drop({ key }) {
      onColumnsReorder(key, column.key);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
    datatype={`${column.dataType}`}
      ref={useCombinedRefs(drag, drop)}
      className={`${isDragging ? "opacity-80" : "opacity-100"} ${
        isOver ? "bg-blue-500" : ""
      }`}
    >
      <SortableHeaderCell
        sortDirection={sortDirection}
        onSort={onSort}
        priority={priority}
        isCellSelected={isCellSelected}
      >
        {isDropped(column.key) ? <s>{column.name}</s> : column.name}
      </SortableHeaderCell>
    </div>
  );
}
