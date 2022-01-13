import { useState, useEffect } from "react";
import { Storage } from "aws-amplify";
import { formatGridData } from "../partials/actions/Dropzone";
import { parse } from "papaparse";

export const useFileSystem = (project) => {
  const [fileSystem, setFileSystem] = useState([]);
  const [filesOpen, setFilesOpen] = useState([]);
  const [sdt, setSdt] = useState("Hello");
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
    // get file list adn setFilesystem
    // set first file with setFileOpen
    // set first file as selected File
    //  set Data grid loading to be true
    //  format data and set it
    //  set data grid loading false
    const getFileSystem = async () => {
      try {
        const data = await Storage.list(`${project.id}/input/`);
        const processed = processStorageList(data);
        console.log({ processed });
        const files = Object.keys(processed[`${project.id}`].input);
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
          console.log({ prev: [filteredFiles[0]] });
          setFilesOpen([filteredFiles[0]]);
          setSelectedFile(filteredFiles[0]);
          setDataGridLoading(true);
          const fileData = await Storage.get(
            `${project.id}/input/${filteredFiles[0]}`,
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
    getFileSystem();
  }, [project]);

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
      // add to filesOpen
      // add to dataGrid
      // set as selected File
      setFilesOpen((prev) => {
        // console.log({ hookset: [...prev, arg] });
        if (prev.length > 0) {
          return [...prev, arg];
        } else return [arg];
      });
      setSelectedFile(arg);
      setDataGridLoading(true);
      const fileData = await Storage.get(`${project.id}/input/${arg}`, {
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
          `${project.id}/input/${newFilesOpen[newFilesOpen.length - 1]}`,
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
    filesOpen,
    dataGrid,
    setDataGrid,
    selectedFile,
    setSelectedFile,
    sdt,
    setSdt,
    dataGridLoading,
    setDataGridLoading,
  };
};
