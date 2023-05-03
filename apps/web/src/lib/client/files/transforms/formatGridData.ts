import { web as webTypes, fileIngestion as fileIngestionTypes } from '@glyphx/types';

/**
 * Takes in papaparsed file data and returns the rendarable grid state
 * @param {File}
 * @returns {webTypes.RenderableDataGrid}
 */
export const formatGridData = (data): webTypes.IRenderableDataGrid => {
  const colNames = Object.keys(data[0]);

  const cols = colNames.map((item, idx) => {
    return {
      key: item,
      name: item === 'glyphx_id__' ? 'id' : item,
      dataType: isNaN(Number(data[0][item]))
        ? fileIngestionTypes.constants.FIELD_TYPE.STRING
        : fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
      width: 120,
      dragable: true,
      resizable: false,
      sortable: false,
    };
  });
  // Generates first column
  const rows = data.map((row, idx) => ({
    ...row,
    id: idx,
  }));
  return { columns: cols, rows };
};
