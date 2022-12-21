import { useCallback, useEffect } from 'react';

import {
  selectedFileAtom,
  fileSystemAtom,
  dataGridLoadingAtom,
  selectedProjectSelector,
  progressDetailAtom,
  GridModalErrorAtom,
  fileStatsSelector,
  matchingFilesAtom,
} from '../state';
import { useSetRecoilState, useRecoilState, useRecoilValue } from 'recoil';
import { compareStats, createFileSystem, createFileSystemFromS3, parseFileStats } from 'partials/files/transforms';
import { useRouter } from 'next/router';
import produce, { original, current } from 'immer';
import { Storage } from 'aws-amplify';
import { FILE_OPERATION } from '@glyphx/types/src/fileIngestion/constants';

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
  const router = useRouter();
  const { orgId, projectId } = router.query;

  const project = useRecoilValue(selectedProjectSelector);
  const existingFileStats = useRecoilValue(fileStatsSelector);
  const [fileSystem, setFileSystem] = useRecoilState(fileSystemAtom);
  const setSelectedFile = useSetRecoilState(selectedFileAtom);
  const setMatchingStats = useSetRecoilState(matchingFilesAtom);
  const setDataGridLoading = useSetRecoilState(dataGridLoadingAtom);

  // update this to be on a per-file basis using an atomFamily
  const setProgress = useSetRecoilState(progressDetailAtom);
  const setGridErrorModal = useSetRecoilState(GridModalErrorAtom);

  // useEffect(() => {
  //   const refreshFiles = async () => {
  //     if (!Array.isArray(projectId))
  //       try {
  //         // client/clientid/modelid/input/tablename/file.csv
  //         const data = await Storage.list(`${orgId}/${projectId}/input/`);
  //         console.log({ data });
  //         const fileSystemData = await createFileSystemFromS3(data, projectId);
  //         // setFileSystem(produce((draft) => fileSystemData));
  //         // // select file
  //         // setSelectedFile(
  //         //   produce((draft) => {
  //         //     draft.index = 0;
  //         //   })
  //         // );
  //       } catch (error) {}
  //   };

  //   // refresh file system on project or org change
  //   if (orgId && projectId) {
  //     refreshFiles();
  //   }
  //   return () => {};
  // }, [orgId, projectId]);

  /**
   * Handle all file ingestion across the application
   * @param {File[]}
   * @returns {void}
   */
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // create loading state
      setDataGridLoading(true);

      // calculate & compare file stats
      const newFileStats = await parseFileStats(acceptedFiles);
      const matchingStats = await compareStats(newFileStats, existingFileStats);

      // immutable update to modal state if decision required
      if (matchingStats && matchingStats.length > 0) {
        setMatchingStats(
          produce((_) => {
            return matchingStats;
          })
        );
      }

      // if no decision required, default to 'ADD'

      // update file system state with processed data based on user decision
      // let newData = createFileSystem(acceptedFiles, fileSystem);
      // setFileSystem([...(Array.isArray(newData) ? newData : [])]);

      // send operations to file ingestion
      // const result = await fetch(`/api/files/browser`, {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     orgId: 'glyphx',
      //     projectId,
      //     fileStats: [
      //       ...(Array.isArray(newFileStats) ? newFileStats : []),
      //       // ...(Array.isArray(existingFileStats) ? existingFileStats : []),
      //     ],
      //     fileInfo: [],
      //   }),
      // });

      //call file ingestion here
      // try {
      //   await fetch(`/api/files/browser?projectId=${projectId}`, {
      //     method: 'POST',
      //     body: createPayload(acceptedFiles)
      //   });

      //     let fileArr = [file.name];
      //     if (project?.files !== null) {
      //       fileArr = [...fileArr, ...project.files];
      //     }
      //     const updatedProject = {
      //       id: project?.id,
      //       filePath: project?.filePath,
      //       properties: project?.properties,
      //       url: project?.url,
      //       shared: project.shared,
      //       description: project.description,
      //       files: fileArr, //adding file to dynamo db
      //     };
      //     console.log({ updatedProject });
      //     let GraphQLresult = await updateProjectInfo(updatedProject);
      //     console.log('GraphQL file update:', { GraphQLresult });
      //   }
    },
    // [setFileSystem, project, fileSystem, setDataGrid]
    [setFileSystem, project, fileSystem]
  );

  /**
   * MANAGE FILESYSTEM USER VIEW
   */
  const openFile = useCallback((idx: number) => {
    // open file
    setFileSystem(
      produce((draft) => {
        draft[idx].open = true;
      })
    );
    // select file
    setSelectedFile(
      produce((draft) => {
        draft.index = idx;
      })
    );
  }, []);

  const selectFile = useCallback(
    (idx: number) => {
      // select file
      setSelectedFile(
        produce((draft) => {
          draft.index = idx;
        })
      );
    },
    [setFileSystem]
  );

  const closeFile = useCallback(
    (idx: number) => {
      // close file
      setFileSystem(
        produce((draft) => {
          draft[idx].open = false;
        })
      );
      // update selection
      setSelectedFile(
        produce((draft) => {
          // if closed file is selected, go to next closest file, else select none (via -1)
          draft.index = draft.index == idx ? idx - 1 : -1;
        })
      );
    },
    [setFileSystem]
  );

  /**
   * Manage File data
   */
  const removeFile = useCallback(
    async (idx, operation: FILE_OPERATION) => {
      // close file
      setFileSystem(
        produce((draft) => {
          draft[idx].open = false;
        })
      );
    },
    [setFileSystem]
  );

  return {
    onDrop,
    openFile,
    selectFile,
    closeFile,
    removeFile,
  };
};
