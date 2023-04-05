import { atom, selector } from 'recoil';
import { web as webTypes, fileIngestion as fileIngestionTypes } from '@glyphx/types';
import { projectAtom } from './project';

/**
 * APPLICATION FILESYSTEM
 * @note We use ```fileSystemAtom``` to denote state generated from s3
 * 
 * The shape looks like this
 * [
    {
      fileName: 'table1.csv',
      tableName: 'table1',
      numberOfRows: 101,
      numberOfColumns: 4,
      columns: [],
      fileSize: 2035,
      dataGrid: { rows: [], columns: [] },
      open: false,
    },
    {
      fileName: 'table2.csv',
      tableName: 'table2',
      numberOfRows: 101,
      numberOfColumns: 4,
      columns: [],
      fileSize: 2035,
      dataGrid: { rows: [], columns: [] },
      open: true,
    },
  ],
 **/

// WRITEABLE STATE HERE
export const fileSystemSelector = selector<webTypes.FileSystem>({
  key: 'fileSystemSelector',
  get: ({ get }) => {
    const project = get(projectAtom);
    return project?.files;
  },
});

/**
 * Holds the index of the currently selected file relative to filesystem. This is important for index based array update patterns to work performantly, -1 denotes non selected
 * */
export const selectedFileAtom = atom<webTypes.SelectedIndex>({
  key: 'selectedFileSelector',
  default: { index: -1 },
});

/**
 * Holds the matches found upon file ingestion between existing and new file statistics.
 * If !== null, modal will display asking user to make a ADD | APPEND choice
 * */
export const matchingFilesAtom = atom<webTypes.IMatchingFileStats[]>({
  key: 'matchingFilesSelector',
  default: null,
});

// READ ONLY STATE BELOW THIS
/**
 * Holds the list of tableNames in displayed in the filetab
 * */
export const filesSelector = selector<string[]>({
  key: 'filesSelector',
  get: ({ get }) => {
    const fileSystem = get(fileSystemSelector);
    if (Array.isArray(fileSystem)) {
      return fileSystem?.map((file) => file?.tableName);
    }
  },
});

/**
 * Holds the formatted FileState for efficient checking
 * */
export const fileStatsSelector = selector<fileIngestionTypes.IFileStats[]>({
  key: 'fileStatsSelector',
  get: ({ get }) => {
    const fileSystem = get(fileSystemSelector);
    if (Array.isArray(fileSystem) && fileSystem?.length > 0) {
      return fileSystem?.map(({ fileName, tableName, numberOfRows, numberOfColumns, columns, fileSize }) => ({
        fileName,
        tableName,
        numberOfRows,
        numberOfColumns,
        columns,
        fileSize,
      }));
    } else {
      return [];
    }
  },
});

/**
 * List of files currently "open" from the user's perspective
 * The index is included to make index based immutable array updates easier / work performantly
 */
export const filesOpenSelector = selector<webTypes.OpenFile[]>({
  key: 'filesOpenAtom',
  get: ({ get }) => {
    const fileSystem = get(fileSystemSelector);
    return (
      fileSystem
        ?.map(({ open, tableName }, idx) => (open ? { tableName, fileIndex: idx } : null))
        .filter((el) => el !== null) || null
    );
  },
});

/**
 * Peels the pre-calculated datagrid off the filesystem to render in react-data-grid
 */
export const dataGridSelector = selector<webTypes.IRenderableDataGrid>({
  key: 'dataGridSelector',
  get: async ({ get }) => {
    const selectedFile = get(selectedFileAtom);
    const fileSystem = get(fileSystemSelector);
    if (fileSystem && fileSystem?.length > 0 && selectedFile?.index !== -1) {
      return fileSystem[selectedFile?.index]?.dataGrid;
    } else {
      return { columns: [], rows: [] };
    }
  },
});

/**
 * Holds the renderable columns of the grid, providing dataType for CSS selectors to override colours
 */
export const columnsSelector = selector<webTypes.GridColumn[]>({
  key: 'columnsSelector',
  get: ({ get }) => {
    let dataGrid = get(dataGridSelector);
    return dataGrid?.columns || [];
  },
});

/**
 * Holds rows of the renderable grid
 */
export const rowsSelector = selector({
  key: 'rowsSelector',
  get: ({ get }) => {
    let dataGrid = get(dataGridSelector);
    return dataGrid?.rows || [];
  },
});
