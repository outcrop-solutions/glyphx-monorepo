import { atom, selector } from "recoil";
import { projectIdAtom } from "./project";
import { Storage } from "aws-amplify";
import { formatGridData } from "partials";
import { parse } from "papaparse";
// utility to process storage list if unzipped
function processStorageList(results) {
  const files = {};

  const add = (source, target, item) => {
    const elements = source.split("/");
    const element = elements.shift();
    if (!element) return; // blank
    target[element] = target[element] || { __data: item }; // element;
    if (elements.length) {
      target[element] =
        typeof target[element] === "object" ? target[element] : {};
      add(elements.join("/"), target[element], item);
    }
  };
  results.forEach((item) => add(item.key, files, item));
  return files;
}

export const filesAtom = atom({
  key: "filesAtom",
  default: selector({
    key: "files/default",
    get: async ({ get }) => {
      let projectId = get(projectIdAtom);
      if (projectId) {
        try {
          const data = await Storage.list(`${projectId}/input/`);

          const processed = processStorageList(data);
          const files = Object.keys(processed[`${projectId}`].input);
          const filteredFiles = files.filter(
            (fileName) => fileName.split(".")[1] === "csv"
          );
          return filteredFiles || [];
        } catch (error) {
          console.log({ error });
        }
      } else {
        return [];
      }
    },
  }),
});

// holds the virtual filesystem displayed in files Tab
export const fileSystemAtom = atom({
  key: "filesystem",
  default: selector({
    key: "filesystem/default",
    get: async ({ get }) => {
      const files = get(filesAtom);
      if (files && files.length > 0) {
        let newData = files.map((item, idx) => {
          return {
            id: idx + 1,
            parent: 0,
            droppable: false,
            text: item,
            data: {
              fileType: item.split(".")[1],
              fileSize: "0.5MB",
            },
          };
        });
        return newData;
      } else {
        return [];
      }
      // add atom effect
    },
  }),
});

// currently selected file
export const selectedFileAtom = atom({
  key: "selectedFileAtom",
  default: selector({
    key: "selectedFile/default",
    get: ({ get }) => {
      const files = get(filesAtom);
      if (files && files.length > 0) {
        return files[0];
      } else {
        return [];
      }
    },
  }),
});

// files currently open
export const filesOpenAtom = atom({
  key: "filesOpenAtom",
  default: selector({
    key: "filesOpen/default",
    get: ({ get }) => {
      const files = get(filesAtom);
      if (files && files.length > 0) {
        return [files[0]];
      } else {
        return [];
      }
    },
  }),
});

// holds the excel data grid state
export const dataGridAtom = atom({
  key: "dataGrid",
  default: selector({
    key: "datagrid/default",
    get: async ({ get }) => {
      const files = get(filesAtom);
      const projectId = get(projectIdAtom);
      if (files && files.length > 0) {
        const fileData = await Storage.get(`${projectId}/input/${files[0]}`, {
          download: true,
        });
        // @ts-ignore
        const blobData = await fileData.Body.text();
        const { data } = parse(blobData, { header: true });
        const grid = formatGridData(data);
        return grid;
      } else {
        return { columns: [], rows: [] };
      }
    },
  }),
});

// holds columns only
export const columnsSelector = selector({
  key: "columns",
  get: ({ get }) => {
    let dataGrid = get(dataGridAtom);
    // @ts-ignore
    return dataGrid.columns;
  },
  set: ({ get, set }, newValue) => {
    // TODO: if we want to use as setable selector,  set datagrid based on changes to the new columns value
  },
});

// holds rows only
export const rowsSelector = selector({
  key: "rows",
  get: ({ get }) => {
    let dataGrid = get(dataGridAtom);
    return dataGrid.rows;
  },
  set: ({ get, set }) => {
   // TODO: if we want to use as setable selector, set datagrid based on changes to the new rows value
  },
});
