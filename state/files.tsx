import { atom, selector } from "recoil";

// holds the virtual filesystem displayed in files Tab
export const fileSystemAtom = atom({
  key: "filesystem",
  default: {},
  // add atom effect
});

// holds the currently selectedFile
export const selectedFileAtom = atom({
  key: "selectedFile",
  default: "",
});

export const filesOpenAtom = atom({
  key: "filesOpen",
  default: [],
});

// holds the excel data grid state
export const dataGridAtom = atom({
  key: "dataGrid",
  default: {},
});

export const columnsSelector = selector({
  key: "columns",
  get: ({ get }) => {
    let dataGrid = get(dataGridAtom);
    // TODO: format data grid
    // @ts-ignore
    return dataGrid.columns;
  },
  set: ({ get, set }) => {
    // TODO: set datagrid based on changes to the new columns value
  },
});

export const rowsSelector = selector({
  key: "rows",
  get: ({ get }) => {
    let dataGrid = get(dataGridAtom);
    // TODO: format data grid
    // @ts-ignore
    return dataGrid.rows;
  },
  set: ({ get, set }) => {
    // TODO: set datagrid based on changes to the new rows value
  },
});

export const gridLoadingSelector = selector({
  key: "gridLoading",
  get: ({ get }) => {
    return false;
  },
  set: ({ get, set }) => {
    // TODO: set datagrid based on changes to the new rows value
  },
});
