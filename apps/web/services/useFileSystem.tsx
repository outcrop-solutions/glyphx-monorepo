import { formatGridData } from "partials";
import { parse } from "papaparse";
import {
  fileSystemAtom,
  selectedFileAtom,
  dataGridAtom,
  dataGridLoadingAtom,
  filesOpenAtom,
  projectIdAtom,
} from "../state";
import { useSetRecoilState, useRecoilState, useRecoilValue } from "recoil";

/**
 * Utilities for interfacting with the DataGrid component and filesystem
 * @param {Array} filtersApplied
 * @returns {Object}
 * openFile - {function}
 * selectFile - {function}
 * closeFile - {function}
 * clearFiles - {function}
 */

export const useFileSystem = () => {
  const setFileSystem = useSetRecoilState(fileSystemAtom);
  const projectId = useRecoilValue(projectIdAtom);
  const [filesOpen, setFilesOpen] = useRecoilState(filesOpenAtom);
  const [selectedFile, setSelectedFile] = useRecoilState(selectedFileAtom);
  const setDataGrid = useSetRecoilState(dataGridAtom);
  const setDataGridLoading = useSetRecoilState(dataGridLoadingAtom);

  return {
    setFiles: (arg) => {
      console.log({ arg });
      setFileSystem((prev) => {
        console.log({ hookset: [...prev, ...arg] });
        return [...prev, ...arg];
      });
    },
    openFile: async (arg) => {
      console.log({ arg });
      // if already in filesOpn && selected, do nothing
      // if in filesOpen && not selected, select and add to datagrid
      // if not in filesOpn && not selected, add to filesOpn && select && add to dataGrid
      // if
      // add to dataGrid
      // set as selected File
      const selectAndLoad = async () => {
        setSelectedFile(arg);
        setDataGridLoading(true);
        const fileData = await Storage.get(`${projectId}/input/${arg}`, {
          download: true,
        });
        // @ts-ignore
        const blobData = await fileData.Body.text();
        const { data } = parse(blobData, { header: true });
        const grid = formatGridData(data);
        setDataGridLoading(false);
        setDataGrid(grid);
      };

      if (filesOpen.includes(arg) && selectedFile === arg) {
        return;
      } else if (filesOpen.includes(arg) && selectedFile !== arg) {
        await selectAndLoad();
      } else if (!filesOpen.includes(arg) && selectedFile !== arg) {
        setFilesOpen((prev) => {
          if (prev.length > 0) {
            return [...prev, arg];
          } else return [arg];
        });
        await selectAndLoad();
      }
    },
    selectFile: async (arg) => {
      // if already selected, do nothing
      // if not selected, add to dataGrid && set as selected File

      if (arg === selectedFile) {
        return;
      }
      setSelectedFile(arg);
      setDataGridLoading(true);
      const fileData = await Storage.get(`${projectId}/input/${arg}`, {
        download: true,
      });
      // @ts-ignore
      const blobData = await fileData.Body.text();
      const { data } = parse(blobData, { header: true });
      const grid = formatGridData(data);
      setDataGridLoading(false);
      setDataGrid(grid);
    },
    closeFile: async (arg) => {
      console.log({ arg });

      let newFilesOpen = [...filesOpen.filter((el) => el !== arg)];
      setFilesOpen(newFilesOpen);
      if (newFilesOpen.length > 0) {
        setSelectedFile(newFilesOpen[newFilesOpen.length - 1]);
        setDataGridLoading(true);
        const fileData = await Storage.get(
          `${projectId}/input/${newFilesOpen[newFilesOpen.length - 1]}`,
          {
            download: true,
          }
        );
        // @ts-ignore
        const blobData = await fileData.Body.text();
        const { data } = parse(blobData, { header: true });
        const grid = formatGridData(data);
        setDataGridLoading(false);
        setDataGrid(grid);
      } else {
        setDataGridLoading(false);
        setSelectedFile("");
        setDataGrid({ rows: [], columns: [] });
      }
    },
    clearFiles: async () => {
      setDataGrid({ columns: [], rows: [] });
      setSelectedFile("");
      setFilesOpen([]);
      setFileSystem([]);
    },
  };
};
