import { useCallback } from 'react';
import { useRouter } from 'next/router';

import { selectedFileAtom, fileSystemAtom, projectAtom, fileStatsSelector, matchingFilesAtom } from 'state';
import { useSetRecoilState, useRecoilState, useRecoilValue } from 'recoil';
import { compareStats, createFileSystem, createFileSystemFromS3, parsePayload } from 'lib/utils/transforms';
import produce from 'immer';
import { FILE_OPERATION } from '@glyphx/types/src/fileIngestion/constants';
import { _ingestFiles, api, useWorkspace, useWorkspaces } from 'lib/client';

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
  const { workspaceSlug } = router.query;
  const { workspace } = useWorkspace(workspaceSlug);
  const project = useRecoilValue(projectAtom);
  const existingFileStats = useRecoilValue(fileStatsSelector);
  const [fileSystem, setFileSystem] = useRecoilState(fileSystemAtom);
  const setSelectedFile = useSetRecoilState(selectedFileAtom);
  const setMatchingStats = useSetRecoilState(matchingFilesAtom);

  // useEffect(() => {
  //   const refreshFiles = async () => {
  //     if (!Array.isArray(projectId))
  //       try {
  //         // client/clientid/modelid/input/tablename/file.csv
  //         const data = await Storage.list(`${orgId}/${projectId}/input/`);
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
      // calculate & compare file stats
      // const newFileStats = await parseFileStats(acceptedFiles);
      // const matchingStats = await compareStats(newFileStats, existingFileStats);

      // immutable update to modal state if decision required
      // if (matchingStats && matchingStats.length > 0) {
      //   setMatchingStats(
      //     produce((_) => {
      //       return matchingStats;
      //     })
      //   );
      // }

      // if no decision required, default to 'ADD'

      // update file system state with processed data based on user decision
      // let newData = createFileSystem(acceptedFiles, fileSystem);
      // setFileSystem([...(Array.isArray(newData) ? newData : [])]);

      // create payload
      const payload = await parsePayload(workspace._id, '641b6e734dd1c59b73eb43da', acceptedFiles);

      // send payload for processing
      api({
        ..._ingestFiles(payload),
      });
    },
    // [setFileSystem, project, fileSystem, setDataGrid]
    [workspace._id]
  );

  /**
   * MANAGE FILESYSTEM USER VIEW
   */
  const openFile = useCallback(
    (idx: number) => {
      // open file
      setFileSystem(
        produce((draft) => {
          draft[idx].open = true;
        })
      );
      // select file
      setSelectedFile(
        produce((draft: any) => {
          draft.index = idx;
        })
      );
    },
    [setFileSystem, setSelectedFile]
  );

  const selectFile = useCallback(
    (idx: number) => {
      // select file
      setSelectedFile(
        produce((draft: any) => {
          draft.index = idx;
        })
      );
    },
    [setSelectedFile]
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
        produce((draft: any) => {
          // if closed file is selected, go to next closest file, else select none (via -1)
          draft.index = draft.index == idx ? idx - 1 : -1;
        })
      );
    },
    [setFileSystem, setSelectedFile]
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
