import { useState, useEffect } from "react";
import { Storage } from "aws-amplify";
import { formatGridData } from "partials";
import { parse } from "papaparse";

/**
 * Utilities for interfacting with the DataGrid component and filesystem
 * @param {Array} filtersApplied
 * @returns {Object}
 * filesSystem - {Array}
 * setFiles - {function}
 * openFile - {function}
 * selectFile - {function}
 * closeFile - {function}
 * clearFiles - {function}
 * filesOpen - {Array}
 * setFilesOpen - {function}
 * dataGrid - {Object}
 * setDataGrid - {function}
 * selectedFile - {string}
 * setSelectedFile - {function}
 * sdt - {string}
 * setsSdt - {function}
 * dataGridLoading - {boolean}
 * setDataGridLoading - {function}
 */

export const useFileSystem = (projectId) => {
  const [fileSystem, setFileSystem] = useState([]);
  const [filesOpen, setFilesOpen] = useState([]);
  const [sdt, setSdt] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [dataGrid, setDataGrid] = useState({ rows: [], columns: [] });
  const [dataGridLoading, setDataGridLoading] = useState(false);

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

  // set filesystem on project change and default open first csv
  useEffect(() => {
    // get file list and setFilesystem
    // set first file with setFileOpen
    // set first file as selected File
    //  set Data grid loading to be true
    //  format data and set it
    //  set data grid loading false
    setDataGrid({ columns: [], rows: [] });
    setSelectedFile("");
    setFilesOpen([]);
    setFileSystem([]);
    const getFileSystem = async () => {
      try {
        const data = await Storage.list(`${projectId}/input/`);

        const processed = processStorageList(data);

        const files = Object.keys(processed[`${projectId}`].input);
        const filteredFiles = files.filter(
          (fileName) =>
            fileName !== "etl_data_lake.csv" && fileName.split(".")[1] === "csv"
        );

        setFileSystem((prev) => {
          let newData = filteredFiles.map((item, idx) => {
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
        });

        if (filteredFiles && filteredFiles.length > 0) {
          setFilesOpen([filteredFiles[0]]);
          setSelectedFile(filteredFiles[0]);
          setDataGridLoading(true);
          const fileData = await Storage.get(
            `${projectId}/input/${filteredFiles[0]}`,
            {
              download: true,
            }
          );
          const blobData = await fileData.Body.text();
          const { data } = parse(blobData, { header: true });
          const grid = formatGridData(data);
          setDataGridLoading(false);
          setDataGrid(grid);
        }
        // });
      } catch (error) {
        console.log({ error });
      }
    };
    if (projectId) {
      getFileSystem();
    }
  }, [projectId]);

  return {
    fileSystem,
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
      console.log({ arg });
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
    filesOpen,
    dataGrid,
    setDataGrid,
    selectedFile,
    setSelectedFile,
    sdt,
    setSdt,
    dataGridLoading,
    setDataGridLoading,
    setFilesOpen,
  };
};
