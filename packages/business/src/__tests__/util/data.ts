import {fileIngestionTypes, webTypes} from 'types';

export const defaultState = {
  properties: {
    X: {
      axis: webTypes.constants.AXIS.X,
      accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
      key: 'Column X', // corresponds to column name
      dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
      interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
      direction: webTypes.constants.DIRECTION_TYPE.ASC,
      filter: {
        min: 0,
        max: 0,
      },
    },
    Y: {
      axis: webTypes.constants.AXIS.Y,
      accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
      key: 'Column Y', // corresponds to column name
      dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
      interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
      direction: webTypes.constants.DIRECTION_TYPE.ASC,
      filter: {
        min: 0,
        max: 0,
      },
    },
    Z: {
      axis: webTypes.constants.AXIS.Z,
      accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
      key: 'Column Z', // corresponds to column name
      dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
      interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
      direction: webTypes.constants.DIRECTION_TYPE.ASC,
      filter: {
        min: 0,
        max: 0,
      },
    },
    A: {
      axis: webTypes.constants.AXIS.A,
      accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
      key: 'Column 1', // corresponds to column name
      dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
      interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
      direction: webTypes.constants.DIRECTION_TYPE.ASC,
      filter: {
        min: 0,
        max: 0,
      },
    },
    B: {
      axis: webTypes.constants.AXIS.B,
      accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
      key: 'Column 2', // corresponds to column name
      dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
      interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
      direction: webTypes.constants.DIRECTION_TYPE.ASC,
      filter: {
        min: 0,
        max: 0,
      },
    },
    C: {
      axis: webTypes.constants.AXIS.C,
      accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
      key: 'Column 3', // corresponds to column name
      dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
      interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
      direction: webTypes.constants.DIRECTION_TYPE.ASC,
      filter: {
        min: 0,
        max: 0,
      },
    },
  },
};
// REACT format
export const file1Dirty = {
  fileName: 'file1.csv',
  tableName: 'file1',
  numberOfRows: 0,
  numberOfColumns: 0,
  columns: [{name: 'name', fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING, longestString: 5}], // only relevant column props included
  fileSize: 0,
  // has datagrid, open, and selected, which are added for react-data-grid on the frontend
  dataGrid: {} as unknown as webTypes.IRenderableDataGrid,
  open: true,
  selected: true,
};
// MONGO format
export const file1Clean = {
  fileName: 'file1.csv',
  tableName: 'file1',
  numberOfRows: 0,
  numberOfColumns: 0,
  columns: [{name: 'name', fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING}], // only relevant column props included
  fileSize: 0,
};

// REACT format
export const file2Dirty = {
  fileName: 'file2.csv',
  tableName: 'file2',
  numberOfRows: 0,
  numberOfColumns: 0,
  columns: [
    // has longestString, which is not supposed to be included in the hash
    {name: 'stringCol', fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING, longestString: 5},
    {name: 'numberCol', fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER},
  ],
  fileSize: 0,
  // has datagrid, open, and selected, which are added for react-data-grid on the frontend
  dataGrid: {} as unknown as webTypes.IRenderableDataGrid,
  open: true,
  selected: true,
};

// MONGO format
export const file2Clean = {
  fileName: 'file2.csv',
  tableName: 'file2',
  numberOfRows: 0,
  numberOfColumns: 0,
  columns: [
    {name: 'stringCol', fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING},
    {name: 'numberCol', fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER},
  ], // only relevant column props included
  fileSize: 0,
};

export const file3Clean = {
  fileName: 'file2.csv',
  tableName: 'file2',
  numberOfRows: 0,
  numberOfColumns: 0,
  // same columns, different order
  columns: [
    {name: 'numberCol', fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER},
    {name: 'name', fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING},
  ], // only relevant column props included
  fileSize: 0,
};

export const filesCleanVariant = [file1Clean, file2Clean];
export const filesDirtyVariant = [file1Dirty, file2Dirty];
export const filesVariant1 = [file1Clean, file2Dirty];
export const filesVariant2 = [file1Dirty, file2Clean];

// THESE VARIANTS ISOLATE FILESYSTEM DIFFERENCES
//
/**
 *  All clean files
 * [clean, clean]
 */
export const project1 = {
  id: 'project1',
  files: filesCleanVariant,
  state: defaultState,
};

/**
 *  All dirty files
 * [dirty, dirty]
 */
export const project2 = {
  id: 'project1',
  files: filesDirtyVariant,
  state: defaultState,
};

export const project3 = {
  id: 'project1',
  files: filesVariant1, // [clean, dirty]
  state: defaultState,
};

export const project4 = {
  id: 'project1',
  files: filesVariant2, // [dirty, clean]
  state: defaultState,
};

// THESE ISOLATE STATE PROPERTY DIFFERENCES
// all clean files
export const project5 = {
  id: 'project1',
  files: filesCleanVariant,
  state: defaultState,
};

// key changes, should produce different hash
export const project6 = {
  id: 'project1',
  files: filesCleanVariant,
  state: {
    ...defaultState,
    properties: {
      ...defaultState.properties,
      X: {
        ...defaultState.properties['X'],
        key: 'new key',
      },
    },
  },
};

// all dirty files
export const project7 = {
  id: 'project1',
  files: [file1Dirty, file2Dirty],
  state: {
    ...defaultState,
    properties: {
      ...defaultState.properties,
      X: {
        ...defaultState.properties['X'],
        erroneous: 'new key',
      },
    },
  },
};

// projectid difference
export const project8 = {
  id: 'project8',
  files: filesCleanVariant,
  state: defaultState,
};
