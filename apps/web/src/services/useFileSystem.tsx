import { useCallback } from 'react';
import produce from 'immer';
import { web as webTypes } from '@glyphx/types';
import { WritableDraft } from 'immer/dist/internal';

import { checkPayload, parsePayload } from 'lib/client/files/transforms';

import { projectAtom, selectedFileIndexSelector, filesOpenSelector, modalsAtom } from 'state';
import { useSetRecoilState, useRecoilState, useRecoilValue } from 'recoil';

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

      // check file for issues before upload
      const modals = checkPayload(payload, project.files, acceptedFiles);

      // open file modals
      setModals(
        produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
          draft.modals = modals;
        })
      );
    },
    // update file system state with processed data based on user decision
    [project, setModals]
  );

  return {
    onDrop,
    openFile,
    selectFile,
    closeFile,
    removeFile,
  };
};
