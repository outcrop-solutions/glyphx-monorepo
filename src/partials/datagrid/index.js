import { useState, useCallback, useMemo } from "react";
import DataGrid, {
  Column,
  HeaderRendererProps,
  SortColumn,
} from "react-data-grid";
import { DraggableHeaderRenderer } from "./DraggableHeaderRenderer";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
function createRows() {
  const rows = [];
  for (let i = 1; i < 500; i++) {
    rows.push({
      id: i,
      task: `Task ${i}`,
      complete: Math.min(100, Math.round(Math.random() * 110)),
      priority: ["Critical", "High", "Medium", "Low"][
        Math.round(Math.random() * 3)
      ],
      issueType: ["Bug", "Improvement", "Epic", "Story"][
        Math.round(Math.random() * 3)
      ],
    });
  }

  return rows;
}

function createColumns() {
  return [
    {
      key: "id",
      name: "ID",
      width: 80,
    },
    {
      key: "task",
      name: "Title",
      resizable: true,
      sortable: true,
    },
    {
      key: "priority",
      name: "Priority",
      resizable: true,
      sortable: true,
    },
    {
      key: "issueType",
      name: "Issue Type",
      resizable: true,
      sortable: true,
    },
    {
      key: "complete",
      name: "% Complete",
      resizable: true,
      sortable: true,
    },
  ];
}

export const Datagrid = () => {
  const [rows] = useState(createRows());
  const [columns, setColumns] = useState(createColumns());
  const [sortColumns, setSortColumns] = useState([]);
  const onSortColumnsChange = useCallback((sortColumns) => {
    setSortColumns(sortColumns.slice(-1));
  }, []);
  const draggableColumns = useMemo(() => {
    function HeaderRenderer(props) {
      return (
        <DraggableHeaderRenderer
          {...props}
          onColumnsReorder={handleColumnsReorder}
        />
      );
    }

    function handleColumnsReorder(sourceKey, targetKey) {
      const sourceColumnIndex = columns.findIndex((c) => c.key === sourceKey);
      const targetColumnIndex = columns.findIndex((c) => c.key === targetKey);
      const reorderedColumns = [...columns];

      reorderedColumns.splice(
        targetColumnIndex,
        0,
        reorderedColumns.splice(sourceColumnIndex, 1)[0]
      );

      setColumns(reorderedColumns);
    }

    return columns.map((c) => {
      if (c.key === "id") return c;
      return { ...c, headerRenderer: HeaderRenderer };
    });
  }, [columns]);
  const sortedRows = useMemo(() => {
    if (sortColumns.length === 0) return rows;
    const { columnKey, direction } = sortColumns[0];

    let sortedRows = [...rows];

    switch (columnKey) {
      case "task":
      case "priority":
      case "issueType":
        sortedRows = sortedRows.sort((a, b) =>
          a[columnKey].localeCompare(b[columnKey])
        );
        break;
      case "complete":
        sortedRows = sortedRows.sort((a, b) => a[columnKey] - b[columnKey]);
        break;
      default:
    }
    return direction === "DESC" ? sortedRows.reverse() : sortedRows;
  }, [rows, sortColumns]);
  return (
    <DndProvider backend={HTML5Backend}>
      <DataGrid
        columns={draggableColumns}
        rows={sortedRows}
        sortColumns={sortColumns}
        onSortColumnsChange={onSortColumnsChange}
      />
    </DndProvider>
  );
  // return <div className='scrollbar-track-transparent scrollbar-thumb-yellow-400'>Hello</div>
  // return <DataGrid columns={columns} rows={rows} />;
};
