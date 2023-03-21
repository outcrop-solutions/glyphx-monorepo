import { atom, selector } from 'recoil';
import {
  GridColumn,
  IFileSystem,
  IMatchingFileStats,
  OpenFile,
  RenderableDataGrid,
  SelectedIndex,
} from 'lib/types';
import { IFileStats } from '@glyphx/types/src/fileIngestion';

/**
 * APPLICATION FILESYSTEM
 * @note We use ```fileSystemAtom``` to update filesystem state - the downstream selectors are nodes in the state dependency graph which inherit their value from this atom. State flows through the acyclic directional graph down to state values renderable by react components.  In the future, this can be bi-directional (where selector nodes can update parents) for performance reasons, however for now we are optimizing for readability and maintianability so that we can add functionality in a performant way.
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
export const fileSystemAtom = atom<IFileSystem>({
  key: 'fileSystemAtom',
  default: null,
});

/**
 * Holds the index of the currently selected file relative to filesystem. This is important for index based array update patterns to work performantly, -1 denotes non selected
 * */
export const selectedFileAtom = atom<SelectedIndex>({
  key: 'selectedFileSelector',
  default: { index: -1 },
});

/**
 * Holds the matches found upon file ingestion between existing and new file statistics.
 * If !== null, modal will display asking user to make a ADD | APPEND choice
 * */
export const matchingFilesAtom = atom<IMatchingFileStats[]>({
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
    const fileSystem = get(fileSystemAtom);
    if (Array.isArray(fileSystem)) {
      return fileSystem.map((file) => file?.tableName);
    }
  },
});

/**
 * Holds the formatted FileState for efficient checking
 * */
export const fileStatsSelector = selector<IFileStats[]>({
  key: 'fileStatsSelector',
  get: ({ get }) => {
    const fileSystem = get(fileSystemAtom);
    if (Array.isArray(fileSystem) && fileSystem?.length > 0) {
      return fileSystem.map(({ fileName, tableName, numberOfRows, numberOfColumns, columns, fileSize }) => ({
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
export const filesOpenSelector = selector<OpenFile[]>({
  key: 'filesOpenAtom',
  get: ({ get }) => {
    const fileSystem = get(fileSystemAtom);
    return (
      fileSystem
        .map(({ open, tableName }, idx) => (open ? { tableName, fileIndex: idx } : null))
        .filter((el) => el !== null) || null
    );
  },
});

/**
 * Peels the pre-calculated datagrid off the filesystem to render in react-data-grid
 */
export const dataGridSelector = selector<RenderableDataGrid>({
  key: 'dataGridSelector',
  get: async ({ get }) => {
    const selectedFile = get(selectedFileAtom);
    const fileSystem = get(fileSystemAtom);
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
export const columnsSelector = selector<GridColumn[]>({
  key: 'columnsSelector',
  get: ({ get }) => {
    let dataGrid = get(dataGridSelector);
    // @ts-ignore
    return dataGrid?.columns;
  },
});

/**
 * Holds rows of the renderable grid
 */
export const rowsSelector = selector({
  key: 'rowsSelector',
  get: ({ get }) => {
    let dataGrid = get(dataGridSelector);
    return dataGrid.rows;
  },
});
