import {databaseTypes, fileIngestionTypes, webTypes} from 'types';

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

// THESE ISOLATE FILESYSTEM DIFFERENCES
// all clean files
export const project1 = {
  files: [file1Clean, file2Clean],
  state: defaultState,
} as unknown as databaseTypes.IProject;

// all dirty files
export const project2 = {
  files: [file1Dirty, file2Dirty],
  state: defaultState,
} as unknown as databaseTypes.IProject;

// mix 1 files
export const project3 = {
  files: [file1Clean, file2Dirty],
  state: defaultState,
} as unknown as databaseTypes.IProject;

// mix 2 files
export const project4 = {
  files: [file2Clean, file1Dirty],
  state: defaultState,
} as unknown as databaseTypes.IProject;

// THESE ISOLATE STATE PROPERTY DIFFERENCES
// all clean files
export const project5 = {
  files: [file1Clean, file2Clean],
  state: defaultState,
} as unknown as databaseTypes.IProject;
// key changes, should produce different hash
export const project6 = {
  files: [file1Clean, file2Clean],
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
} as unknown as databaseTypes.IProject;

// all dirty files
export const project7 = {
  files: [file1Dirty, file2Dirty],
  state: defaultState,
} as unknown as databaseTypes.IProject;

// mix 1 files
export const project8 = {
  files: [file1Clean, file2Dirty],
  state: defaultState,
} as unknown as databaseTypes.IProject;

// mix 2 files
export const project9 = {
  files: [file2Clean, file1Dirty],
  state: defaultState,
} as unknown as databaseTypes.IProject;
