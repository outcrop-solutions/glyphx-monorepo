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
}) {
  const [{ isDragging }, drag] = useDrag({
    type: 'COLUMN_DRAG',
    item: { key: column.key,  type: 'COLUMN_DRAG', },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

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
      ref={useCombinedRefs(drag, drop)}
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isOver ? "#ececec" : undefined,
        cursor: "move",
      }}
    >
      <SortableHeaderCell
        sortDirection={sortDirection}
        onSort={onSort}
        priority={priority}
        isCellSelected={isCellSelected}
      >
        {column.name}
      </SortableHeaderCell>
    </div>
  );
}
