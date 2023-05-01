import { useCallback } from 'react';
import produce from 'immer';
import { web as webTypes } from '@glyphx/types';
import { WritableDraft } from 'immer/dist/internal';

import { checkPayload, parsePayload } from 'lib/client/files/transforms';

import { projectAtom, selectedFileIndexSelector, filesOpenSelector, showModalAtom } from 'state';
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
  const setShowModal = useSetRecoilState(showModalAtom);

  const selectFile = useCallback(
    (idx: number) => {
      // select file
      setProject(
        produce((draft: WritableDraft<webTypes.HydratedProject>) => {
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
        produce((draft: WritableDraft<webTypes.HydratedProject>) => {
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
        produce((draft: WritableDraft<webTypes.HydratedProject>) => {
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
        produce((draft: WritableDraft<webTypes.HydratedProject>) => {
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
      const errors = checkPayload(payload, project.files);

      // open file modals
      for (const err of errors) {
        setShowModal(
          produce((draft: WritableDraft<webTypes.ModalState>) => {
            draft.type = err.type;
            draft.data = err.data;
          })
        );
      }
    },
    // update file system state with processed data based on user decision
    [project, setShowModal]
  );

  return {
    onDrop,
    openFile,
    selectFile,
    closeFile,
    removeFile,
  };
};
