'use client';
import {useCallback} from 'react';
import produce from 'immer';
import {databaseTypes, webTypes} from 'types';
import {WritableDraft} from 'immer/dist/internal';
import {useSWRConfig} from 'swr';
import {projectAtom, selectedFileIndexSelector, filesOpenSelector, modalsAtom, showLoadingAtom} from 'state';
import {useSetRecoilState, useRecoilState, useRecoilValue} from 'recoil';
import {_uploadFile, api} from 'lib';
import {runRulesEngine} from 'lib/client/files/engine';
import {parsePayload} from 'lib/client/files/transforms/parsePayload';
import {useSession} from 'next-auth/react';
import {fileIngestion, signUploadUrls} from 'actions';
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
  const {mutate} = useSWRConfig();
  const session = useSession();
  const [project, setProject] = useRecoilState(projectAtom);
  const selectedFileIndex = useRecoilValue(selectedFileIndexSelector);
  const openFiles = useRecoilValue(filesOpenSelector);
  const setModals = useSetRecoilState(modalsAtom);
  const setLoading = useSetRecoilState(showLoadingAtom);

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
          if (openFiles?.length > 1) {
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
      const payload = await parsePayload(
        project?.workspace.id,
        project.id,
        acceptedFiles,
        session?.data?.user?.name || session?.data?.user?.email || ''
      );

      // check file against FILE_RULES before upload
      const modals = runRulesEngine(payload, project.files, acceptedFiles);

      if (modals) {
        // open file error/decision modals
        setModals(
          produce((draft: WritableDraft<any>) => {
            draft.modals = modals;
          })
        );
        return;
      } else {
        setLoading(
          produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
            draft.processName = 'File Upload';
            draft.processStatus = databaseTypes.constants.PROCESS_STATUS.PENDING;
          })
        );
        // get s3 keys for upload
        const keys = payload.fileStats.map((stat) => `${stat.tableName}/${stat.fileName}`);

        const {signedUrls, error} = await signUploadUrls(keys, project?.workspace.id, project.id);

        if (!error && signedUrls) {
          await Promise.all(
            signedUrls.map(async (url, idx) => {
              // upload raw file data to s3
              setLoading(
                produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
                  draft.processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
                  draft.processStartTime = new Date();
                })
              );
              // still need this as its an 3rd party api call to s3
              await api({
                ..._uploadFile(await acceptedFiles[idx].arrayBuffer(), url),
                upload: true,
                onError: () => {
                  setLoading(
                    produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
                      draft.processStatus = databaseTypes.constants.PROCESS_STATUS.FAILED;
                      draft.processEndTime = new Date();
                    })
                  );
                },
                onSuccess: () => {
                  setLoading(
                    produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
                      draft.processStatus = databaseTypes.constants.PROCESS_STATUS.COMPLETED;
                    })
                  );
                },
              });
            })
          );
        }

        setLoading(
          produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
            draft.processName = 'File Ingestion';
            draft.processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
          })
        );

        // only call ingest once
        const retval = await fileIngestion(payload);
        console.log({retval});

        if (!retval?.error) {
          setLoading(
            produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
              draft.processStatus = databaseTypes.constants.PROCESS_STATUS.COMPLETED;
              draft.processEndTime = new Date();
            })
          );
        } else {
          setLoading(
            produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
              draft.processStatus = databaseTypes.constants.PROCESS_STATUS.FAILED;
              draft.processEndTime = new Date();
            })
          );
        }
        setLoading({});
      }
    },
    // update file system state with processed data based on user decision
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project, setLoading, setModals, mutate]
  );

  return {
    onDrop,
    openFile,
    selectFile,
    closeFile,
    removeFile,
  };
};
