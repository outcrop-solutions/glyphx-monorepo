import { atom, selector } from "recoil";

export const fileSystemAtom = atom({
  key: "filesystem",
  // add atom effect
});

export const selectedFileAtom = atom({
  key: "selectedFile",
  default: {},
});

export const dataGridSelector = selector({
  key: "dataGrid",
  get: ({ get }) => {
    let selectedFile = get(selectedFileAtom);
    // TODO: format data grid
    // @ts-ignore
    return selectedFile;
  },
  // set: ({ set, get }, newFitlersValue) => {
  //   // @ts-ignore
  //   let selectedFile = get(selectedFileAtom);
  //   let newSelectedFileValue = {
  //     ...selectedFile,
  //     fitlers: [...newFitlersValue],
  //   };

  //   set(selectedProjectAtom, newSelectedProjectValue);
  // },
});

export const columnsSelector = selector({
  key: "columns",
  get: ({ get }) => {
    let dataGrid = get(dataGridSelector);
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
    let dataGrid = get(dataGridSelector);
    // TODO: format data grid
    // @ts-ignore
    return dataGrid.rows;
  },
  set: ({ get, set }) => {
    // TODO: set datagrid based on changes to the new rows value
  },
});
