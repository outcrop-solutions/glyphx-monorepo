import { useDrag, useDrop } from "react-dnd";

import { SortableHeaderCell } from "./SortableHeaderCell";

import { useCombinedRefs } from "services/useCombinedRefs";

export function DraggableHeaderRenderer({
  onColumnsReorder,
  column,
  sortDirection,
  onSort,
  priority,
  isCellSelected,
  isDropped,
}) {
  // @ts-ignore
  const [{ isDragging }, drag] = useDrag({
    // @ts-ignore
    type: "COLUMN_DRAG",
    item: { key: column.key, type: "COLUMN_DRAG", dataType: column.dataType, index:column.idx - 1 },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: "COLUMN_DRAG",
    // @ts-ignore
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
        <p>{isDropped(column.key) ? <s>{column.name}</s> : column.name}</p>
      </SortableHeaderCell>
    </div>
  );
}
