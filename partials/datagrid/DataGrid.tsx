import { useState, useCallback, useMemo, useEffect } from "react";
import DataGrid from "lib/react-data-grid/lib/bundle";
import { DraggableHeaderRenderer } from "./DraggableHeaderRenderer";

export const Datagrid = ({ isDropped, dataGrid }) => {
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
        <>
          {columns && columns.length > 0 && (
            <DraggableHeaderRenderer
              {...props}
              isDropped={isDropped}
              onColumnsReorder={handleColumnsReorder}
            />
          )}
        </>
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
  }, [columns, isDropped]);

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
      headerRowHeight={20}
      rowHeight={20}
      columns={draggableColumns}
      rows={sortedRows}
      sortColumns={sortColumns}
      onSortColumnsChange={onSortColumnsChange}
    />
  );
};
