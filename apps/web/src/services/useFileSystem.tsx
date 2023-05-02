import { useCallback } from 'react';
import produce from 'immer';
import { web as webTypes } from '@glyphx/types';
import { WritableDraft } from 'immer/dist/internal';

import { projectAtom, selectedFileIndexSelector, filesOpenSelector, modalsAtom } from 'state';
import { useSetRecoilState, useRecoilState, useRecoilValue } from 'recoil';
import { _ingestFiles, _uploadFile, api } from 'lib';
import { checkPayload } from 'lib/client/files/checkPayload';
import { parsePayload } from 'lib/client/files/parsePayload';

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
  const setModals = useSetRecoilState(modalsAtom);

  const selectFile = useCallback(
    (idx: number) => {
      // select file
      setProject(
        produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
          if (selectedFileIndex !== -1) {
            draft.files[selectedFileIndex].selected = false;
          }
          draft.files[idx].selected = true;
        })
      );
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
        produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
          if (selectedFileIndex !== -1) {
            draft.files[selectedFileIndex].selected = false;
          }
          draft.files[idx].open = true;
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
        produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
          if (openFiles?.length > 0) {
            draft.files[openFiles[0].fileIndex].selected = true;
          }
          draft.files[idx].open = false;
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
    async (idx) => {
      // close file
      setProject(
        produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
          draft.files[idx].open = false;
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

      // check file against FILE_RULES before upload
      const modals = checkPayload(payload, project.files);

      if (modals) {
        // open file error/decision modals
        setModals(
          produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
            draft.modals = modals;
          })
        );
        return;
      } else {
        // get s3 keys for upload
        const keys = payload.fileStats.map((stat) => `${stat.tableName}/${stat.fileName}`);
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
              produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
                draft.files = data.payload.fileStats;
                draft.files[0].dataGrid = data.dataGrid;
                draft.files[0].open = true;
              })
            );
            // open first file
            selectFile(0);
          },
        });
      }
    },
    // update file system state with processed data based on user decision
    [project, selectFile, setModals, setProject]
  );

  return {
    onDrop,
    openFile,
    selectFile,
    closeFile,
    removeFile,
  };
};
