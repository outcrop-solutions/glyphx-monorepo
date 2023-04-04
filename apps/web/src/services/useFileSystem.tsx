import { useCallback } from 'react';
import { useRouter } from 'next/router';

import {
  selectedFileAtom,
  fileSystemAtom,
  projectAtom,
  fileStatsSelector,
  matchingFilesAtom,
  workspaceAtom,
} from 'state';
import { useSetRecoilState, useRecoilState, useRecoilValue } from 'recoil';
import { compareStats, parsePayload } from 'lib/client/files/transforms';
import produce from 'immer';
import { FILE_OPERATION } from '@glyphx/types/src/fileIngestion/constants';
import { _ingestFiles, api, useWorkspace } from 'lib/client';

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
  const workspace = useRecoilValue(workspaceAtom);
  const [project, setProject] = useRecoilState(projectAtom);
  const existingFileStats = useRecoilValue(fileStatsSelector);
  const [fileSystem, setFileSystem] = useRecoilState(fileSystemAtom);
  const setSelectedFile = useSetRecoilState(selectedFileAtom);
  const setMatchingStats = useSetRecoilState(matchingFilesAtom);

  /**
   * Handle all file ingestion across the application
   * @param {File[]}
   * @returns {void}
   */
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // calculate & compare file stats
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

      // create payload
      console.log({ workspace, project });
      if (workspace?.id && project?._id) {
        const payload = await parsePayload(workspace._id, project._id, acceptedFiles);
        console.log({ payload });
        setProject(
          produce((draft) => {
            // @ts-ignore
            draft.files = payload.fileStats;
          })
        );
      }
      // send payload for processing
      // api({
      //   ..._ingestFiles(payload),
      // });
    },
    // [setFileSystem, project, fileSystem, setDataGrid]
    [project, setProject, workspace]
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
      selectFile(idx);
    },
    [selectFile, setFileSystem]
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
