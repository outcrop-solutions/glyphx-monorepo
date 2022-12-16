import { Storage } from 'aws-amplify';
import { formatGridData } from 'partials';
import { parse } from 'papaparse';
import {
  fileSystemAtom,
  selectedFileAtom,
  dataGridAtom,
  dataGridLoadingAtom,
  filesOpenAtom,
  projectIdAtom,
  selectedProjectSelector,
} from '../state';
import { useSetRecoilState, useRecoilState, useRecoilValue } from 'recoil';
import { useCallback, useState } from 'react';
import { createFileSystem } from '@/partials/files/transforms';
import { postUploadCall } from './ETLCalls';
import { updateProjectInfo } from './GraphQLCalls';

const cleanTableName = (fileName) => {
  return fileName.split('.')[0].trim().toLowerCase();
};

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
  const [fileSystem, setFileSystem] = useRecoilState(fileSystemAtom);
  const projectId = useRecoilValue(projectIdAtom);
  const [filesOpen, setFilesOpen] = useRecoilState(filesOpenAtom);
  const [selectedFile, setSelectedFile] = useRecoilState(selectedFileAtom);
  const setDataGrid = useSetRecoilState(dataGridAtom);
  const setDataGridLoading = useSetRecoilState(dataGridLoadingAtom);
  const project = useRecoilValue(selectedProjectSelector);
  const setDataGridState = useSetRecoilState(dataGridLoadingAtom);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      setDataGridState(true);
      //update file system state with processed data
      let newData = createFileSystem(acceptedFiles, fileSystem);
      setFileSystem([...(Array.isArray(newData) ? newData : [])]);

      acceptedFiles.forEach(async (file: File) => {
        console.log({ file });
        // format data grid to render
        const text = await file.text();
        const { data } = parse(text, { header: true });
        const grid = formatGridData(data);
        setDataGrid(grid);
        setFilesOpen((prev) => [...prev, file.name]);
        setSelectedFile(file.name);

        // send stream to file ingestion
        const stream = await file.stream();

        // const options: RequestInit = {
        //   method: 'POST',
        //   body: stream,
        //   duplex: 'half',
        // };

        // const input = `/api/file-ingest?fileName=${encodeURIComponent(file.name)}`;

        // const req = new Request(input, options);
        // const formData = new FormData();
        // formData.append('projectId', projectId);
        // formData.append('file', file);
        // const result = await fetch(req);
        //
      });

      // add to filesystem state
      // upload files to S3
    },
    // [setFileSystem, project, fileSystem, setDataGrid]
    []
  );

  return {
    onDrop,
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
        const fileData = await Storage.get(`${projectId}/input/${newFilesOpen[newFilesOpen.length - 1]}`, {
          download: true,
        });
        // @ts-ignore
        const blobData = await fileData.Body.text();
        const { data } = parse(blobData, { header: true });
        const grid = formatGridData(data);
        setDataGridLoading(false);
        setDataGrid(grid);
      } else {
        setDataGridLoading(false);
        setSelectedFile('');
        setDataGrid({ rows: [], columns: [] });
      }
    },
    clearFiles: async () => {
      setDataGrid({ columns: [], rows: [] });
      setSelectedFile('');
      setFilesOpen([]);
      setFileSystem([]);
    },
  };
};
