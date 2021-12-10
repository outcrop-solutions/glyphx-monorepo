import { useState, useCallback, useMemo, useEffect } from "react";
import DataGrid from "react-data-grid";
import { DraggableHeaderRenderer } from "./DraggableHeaderRenderer";

// function createRows() {
//   const rows = [];
//   for (let i = 1; i < 500; i++) {
//     rows.push({
//       id: i,
//       task: `Task ${i}`,
//       complete: Math.min(100, Math.round(Math.random() * 110)),
//       priority: ["Critical", "High", "Medium", "Low"][
//         Math.round(Math.random() * 3)
//       ],
//       issueType: ["Bug", "Improvement", "Epic", "Story"][
//         Math.round(Math.random() * 3)
//       ],
//     });
//   }

//   return rows;
// }

// function createColumns() {
//   return [
//     {
//       key: "id",
//       name: "ID",
//       width: 80,
//     },
//     {
//       key: "task",
//       name: "Title",
//       resizable: true,
//       sortable: true,
//     },
//     {
//       key: "priority",
//       name: "Priority",
//       resizable: true,
//       sortable: true,
//     },
//     {
//       key: "issueType",
//       name: "Issue Type",
//       resizable: true,
//       sortable: true,
//     },
//     {
//       key: "complete",
//       name: "% Complete",
//       resizable: true,
//       sortable: true,
//     },
//   ];
// }

export const Datagrid = ({
  isDropped,
  dataGrid,
  setIsEditing,
  setDataGrid,
}) => {
  const [rows, setRows] = useState(dataGrid.rows);
  const [columns, setColumns] = useState(dataGrid.columns);
  const [sortColumns, setSortColumns] = useState([]);
  const onSortColumnsChange = useCallback((sortColumns) => {
    setSortColumns(sortColumns.slice(-1));
  }, []);

  //set datagrid data
  useEffect(() => {
    const newCols = dataGrid.columns;
    setColumns(newCols);
  }, [dataGrid.columns]);
  useEffect(() => {
    const newRows = dataGrid.rows;
    setRows(newRows);
  }, [dataGrid.rows]);

  // data grid column handling
  const draggableColumns = useMemo(() => {
    function HeaderRenderer(props) {
      return (
        <DraggableHeaderRenderer
          {...props}
          isDropped={isDropped}
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

  // data grid row handling
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
    <DataGrid
      className="max-h-full h-screen scrollbar-thin scrollbar-track-transparent scrollbar-thumb-yellow-400 scrollbar-thumb-rounded-full"
      columns={draggableColumns}
      rows={sortedRows}
      sortColumns={sortColumns}
      onSortColumnsChange={onSortColumnsChange}
    />
  );
};
