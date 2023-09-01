import { webTypes } from 'types';

/**
 * Takes in papaparsed file data and returns the rendarable grid state
 * @param {File}
 * @returns {webTypes.RenderableDataGrid}
 */
export const formatGridData = (data, columns): webTypes.IRenderableDataGrid => {
  const dateFields: string[] = [];
  const cols = columns.map(({ name, fieldType }, idx) => {
    if (fieldType === 3) {
      dateFields.push(name);
    }
    return {
      key: name,
      name: name === 'glyphx_id__' ? 'id' : name,
      dataType: fieldType,
      width: 120,
      dragable: true,
      resizable: false,
      sortable: false,
    };
  });

  // Modify rows
  const rows = data.map((row, idx) => {
    const formattedRow = { ...row, id: idx };
    dateFields.forEach((dateField) => {
      const date = new Date(row[dateField]);
      if (!isNaN(date.getTime())) {
        formattedRow[dateField] = date.toISOString();
      }
      // } else {
      //   throw Error(`${row[dateField]} cannot be parsed into a valid date`);
      // }
    });
    return formattedRow;
  });

  return { columns: cols, rows };
};
