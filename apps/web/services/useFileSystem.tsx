import { useCallback } from 'react';

import {
  selectedFileAtom,
  fileSystemAtom,
  dataGridLoadingAtom,
  selectedProjectSelector,
  progressDetailAtom,
  GridModalErrorAtom,
} from '../state';
import { useSetRecoilState, useRecoilState, useRecoilValue } from 'recoil';
import { compareStats, createFileSystem, createFileSystemFromS3, parseFileStats } from 'partials/files/transforms';
import { useRouter } from 'next/router';
import produce, { original, current } from 'immer';

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
  const [fileSystem, setFileSystem] = useRecoilState(fileSystemAtom);
  const setSelectedFile = useSetRecoilState(selectedFileAtom);
  const setDataGridLoading = useSetRecoilState(dataGridLoadingAtom);

  // update this to be on a per-file basis using an atomFamily
  const setProgress = useSetRecoilState(progressDetailAtom);
  const setGridErrorModal = useSetRecoilState(GridModalErrorAtom);

  // useEffect(() => {
  //   const refreshFiles = async () => {
  //     if (!Array.isArray(projectId))
  //       try {
  //         // client/clientid/modelid/input/tablename/file.csv
  //         const data = await Storage.list(`client/${orgId}/${projectId}/input/`);
  //         setFileSystem(createFileSystemFromS3(data, projectId));
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
      // const matchingStats = await compareStats(newFileStats, existingFileStats);

      // ask user to make decision based on list

      // update file system state with processed data based on user decision
      let newData = createFileSystem(acceptedFiles, fileSystem);
      setFileSystem([...(Array.isArray(newData) ? newData : [])]);

      // send operations to file ingestion
      const result = await fetch(`/api/files/browser`, {
        method: 'POST',
        body: JSON.stringify({
          orgId: 'glyphx',
          projectId,
          fileStats: [
            ...(Array.isArray(newFileStats) ? newFileStats : []),
            // ...(Array.isArray(existingFileStats) ? existingFileStats : []),
          ],
          fileInfo: [],
        }),
      });

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
  const openFile = useCallback((idx) => {
    // open file
    setFileSystem(
      produce((draft) => {
        draft[idx].open = true;
        console.log({ draft: current(draft) });
      })
    );
    // select file
    setSelectedFile(
      produce((draft) => {
        draft = idx;
      })
    );
  }, []);

  const selectFile = useCallback(
    (idx) => {
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
    (idx) => {
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
          draft.index = original(draft) == idx ? idx - 1 : -1;
        })
      );
    },
    [setFileSystem]
  );

  /**
   * Manage File data
   */
  const removeFile = useCallback(
    (idx) => {
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
