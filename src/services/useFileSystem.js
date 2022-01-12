import { useState, useEffect } from "react";
import { Storage } from "aws-amplify";

export const useFileSystem = (project) => {
  const [fileSystem, setFileSystem] = useState([]);
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

  useEffect(() => {
    const getFileSystem = async () => {
      try {
        const data = await Storage.list(`${project.id}/input/`);
        const processed = processStorageList(data);
        console.log({ processed });
        const files = Object.keys(processed[`${project.id}`].input);

        // let sidebarData = await Storage.get(`sidebar.json`, {
        //   download: true,
        // });
        // data.Body is a Blob
        // sidebarData.Body.text().then((string) => {
        //   let { files } = JSON.parse(string);

        setFileSystem((prev) => {
          let filtered = files.filter((file) => file.split(".")[1] === "csv");
          let newData = filtered.map((item, idx) => ({
            id: idx + 1,
            parent: 0,
            droppable: false,
            text: item,
            data: {
              fileType: item.split(".")[1],
              fileSize: "0.5MB",
            },
          }));
          console.log({ newFilesystem: newData });
          return newData;
        });
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
    clearFiles: (arg) => {
      setFileSystem([]);
    },
  };
};
