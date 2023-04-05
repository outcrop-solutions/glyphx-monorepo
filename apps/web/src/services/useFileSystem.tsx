import { useCallback } from 'react';
import { useRouter } from 'next/router';

import {
  selectedFileAtom,
  fileSystemSelector,
  projectAtom,
  fileStatsSelector,
  matchingFilesAtom,
  workspaceAtom,
} from 'state';
import { useSetRecoilState, useRecoilState, useRecoilValue } from 'recoil';
import { compareStats, parsePayload } from 'lib/client/files/transforms';
import produce from 'immer';
import { FILE_OPERATION } from '@glyphx/types/src/fileIngestion/constants';
import { _getSignedUploadUrls, _ingestFiles, api, useWorkspace, _uploadFile } from 'lib/client';

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
  const setSelectedFile = useSetRecoilState(selectedFileAtom);
  const existingFileStats = useRecoilValue(fileStatsSelector);
  const fileSystem = useRecoilValue(fileSystemSelector);
  const setMatchingStats = useSetRecoilState(matchingFilesAtom);

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
      setProject(
        produce((draft) => {
          // @ts-ignore
          draft.files[idx].open = true;
        })
      );
      // select file
      selectFile(idx);
    },
    [selectFile, setProject]
  );

  const closeFile = useCallback(
    (idx: number) => {
      // close file
      setProject(
        produce((draft) => {
          // @ts-ignore
          draft.files[idx].open = false;
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
    [setProject, setSelectedFile]
  );

  /**
   * Manage File data
   */
  const removeFile = useCallback(
    async (idx, operation: FILE_OPERATION) => {
      // close file
      setProject(
        produce((draft) => {
          // @ts-ignore
          draft.files[idx].open = false;
        })
      );
    },
    [setProject]
  );

  /**
   * Handle all file ingestion across the application
   * @param {File[]}
   * @returns {void}
   */
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // parse payload
      const payload = await parsePayload(workspace._id, project._id, acceptedFiles);

      // get signed urls
      api({
        ..._getSignedUploadUrls(workspace._id, project._id, payload.fileStats),
        onSuccess: ({ data }) => {
          Promise.all(
            data.signedUrls.map((url, idx) => {
              // upload raw file data to s3
              api({
                ..._uploadFile(acceptedFiles[idx], url),
                onSuccess: (res) => {
                  // run ingestor on files
                  api({
                    ..._ingestFiles(payload),
                    onSuccess: () => {
                      // update project filesystem
                      setProject(
                        produce((draft) => {
                          // @ts-ignore
                          draft.files = payload.fileStats;
                        })
                      );
                      // open first file
                      selectFile(0);
                    },
                  });
                },
              });
            })
          );
        },
      });

      // ingest files

      // TODO: add calculate & compare file stats once error free
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
    },
    [project?._id, selectFile, setProject, workspace?._id]
  );

  return {
    onDrop,
    openFile,
    selectFile,
    closeFile,
    removeFile,
  };
};
