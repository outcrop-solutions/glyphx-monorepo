import { useCallback, useEffect } from 'react';

import {
  projectAtom,
  fileStatsSelector,
  matchingFilesAtom,
  selectedFileIndexSelector,
  filesOpenSelector,
  showModalAtom,
} from 'state';
import { useSetRecoilState, useRecoilState, useRecoilValue } from 'recoil';
import { checkPayload, parsePayload } from 'lib/client/files/transforms';
import produce, { current } from 'immer';
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
  const [project, setProject] = useRecoilState(projectAtom);
  const selectedFileIndex = useRecoilValue(selectedFileIndexSelector);
  const openFiles = useRecoilValue(filesOpenSelector);
  const setShowModal = useSetRecoilState(showModalAtom);
  // const { fetchData } = useDataGrid();
  // const existingFileStats = useRecoilValue(fileStatsSelector);
  // const setMatchingStats = useSetRecoilState(matchingFilesAtom);

  const selectFile = useCallback(
    (idx: number) => {
      // select file
      setProject(
        produce((draft) => {
          if (selectedFileIndex !== -1) {
            // @ts-ignore
            draft.files[selectedFileIndex].selected = false;
          }
          // @ts-ignore
          draft.files[idx].selected = true;
        })
      );
      // fetchData(idx);
    },
    [selectedFileIndex, setProject]
  );

  /**
   * MANAGE FILESYSTEM USER VIEW
   */
  const openFile = useCallback(
    (idx: number) => {
      // open file
      setProject(
        produce((draft) => {
          if (selectedFileIndex !== -1) {
            // @ts-ignore
            draft.files[selectedFileIndex].selected = false;
          }
          // @ts-ignore
          draft.files[idx].open = true;
          // @ts-ignore
          draft.files[idx].selected = true;
        })
      );
    },
    [selectedFileIndex, setProject]
  );

  const closeFile = useCallback(
    (idx: number) => {
      // close file
      setProject(
        produce((draft) => {
          if (openFiles?.length > 0) {
            // @ts-ignore
            draft.files[openFiles[0].fileIndex].selected = true;
          }
          // @ts-ignore
          draft.files[idx].open = false;
          // @ts-ignore
          draft.files[idx].selected = false;
        })
      );
    },
    [openFiles, setProject]
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
          // @ts-ignore
          draft.files[idx].selected = false;
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
      const payload = await parsePayload(project.workspace._id, project._id, acceptedFiles);

      // check file for issues before upload
      const errs = checkPayload(payload, project.files);
      if (errs) {
        // open file modal
        setShowModal(
          produce((draft) => {
            draft.type = 'fileErrors';
            draft.data = { fileErrors: errs };
          })
        );
      } else {
        // get s3 keys for upload
        const keys = payload.fileStats.map((stat) => `${stat.tableName}/${stat.fileName}`);
        // get signed urls
        // api({
        // ..._getSignedUploadUrls(workspace._id.toString(), project._id.toString(), keys),
        // onSuccess: ({ signedUrls }) => {
        await Promise.all(
          keys.map(async (key, idx) => {
            // upload raw file data to s3
            await api({
              ..._uploadFile(
                await acceptedFiles[idx].arrayBuffer(),
                key,
                project.workspace._id.toString(),
                project._id.toString()
              ),
              upload: true,
            });
          })
        );

        // only call ingest once
        await api({
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
      }
      // update file system state with processed data based on user decision
    },
    [project, selectFile, setProject]
  );

  return {
    onDrop,
    openFile,
    selectFile,
    closeFile,
    removeFile,
  };
};
