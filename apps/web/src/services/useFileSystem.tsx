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
import produce, { current } from 'immer';
import { FILE_OPERATION } from '@glyphx/types/src/fileIngestion/constants';
import { _getSignedUploadUrls, _ingestFiles, api, useWorkspace, _uploadFile } from 'lib/client';
import useDataGrid from 'lib/client/hooks/useDataGrid';

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
  // const { fetchData } = useDataGrid();
  // const existingFileStats = useRecoilValue(fileStatsSelector);
  // const fileSystem = useRecoilValue(fileSystemSelector);
  // const setMatchingStats = useSetRecoilState(matchingFilesAtom);

  const selectFile = useCallback(
    (idx: number) => {
      console.log('called selectFile');
      // select file
      setSelectedFile(
        produce((draft: any) => {
          draft.index = idx;
        })
      );
      // fetchData(idx);
    },
    [setSelectedFile]
  );

  /**
   * MANAGE FILESYSTEM USER VIEW
   */
  const openFile = useCallback(
    (idx: number) => {
      console.log('called openFile');
      // open file
      setProject(
        produce((draft) => {
          // @ts-ignore
          draft.files[idx].open = true;
        })
      );
      setSelectedFile(
        produce((draft: any) => {
          draft.index = idx;
        })
      );
    },
    [setProject, setSelectedFile]
  );

  const closeFile = useCallback(
    (idx: number) => {
      console.log('called closeFile');
      // close file
      setProject(
        produce((draft) => {
          console.log({ draft: current(draft), closeFile: true });
          // @ts-ignore
          draft.files[idx].open = false;
        })
      );
      // update selection
      setSelectedFile(
        produce((draft: any) => {
          console.log({ draft: current(draft), index: true });
          // if closed file is selected, go to next closest file, else select none (via -1)
          draft.index = draft.index == idx ? idx - 1 : -1;

          console.log({ draft: current(draft), index: 'after' });
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

      // get s3 keys for upload
      const keys = payload.fileStats.map((stat) => `${stat.tableName}/${stat.fileName}`);

      console.log({ hook: true, payload });
      // get signed urls
      // api({
      // ..._getSignedUploadUrls(workspace._id.toString(), project._id.toString(), keys),
      // onSuccess: ({ signedUrls }) => {
      Promise.all(
        keys.map(async (key, idx) => {
          // upload raw file data to s3
          api({
            ..._uploadFile(
              await acceptedFiles[idx].arrayBuffer(),
              key,
              workspace._id.toString(),
              project._id.toString()
            ),
            upload: true,
            onSuccess: (upload) => {
              // run ingestor on files
              api({
                ..._ingestFiles(payload),
                onSuccess: (data) => {
                  // update project filesystem
                  setProject(
                    produce((draft) => {
                      // @ts-ignore
                      draft.files = payload.fileStats;
                      // @ts-ignore
                      draft.files[0].dataGrid = data.dataGrid;
                      // @ts-ignore
                      draft.files[0].open = true;
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
      // },
      // });

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
    [project, selectFile, setProject, workspace]
  );

  return {
    onDrop,
    openFile,
    selectFile,
    closeFile,
    removeFile,
  };
};
