import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { web as webTypes, database as databaseTypes } from '@glyphx/types';
import { _updateProjectState, api } from 'lib/client';
import { doesStateExistSelector, projectAtom, showLoadingAtom } from 'state';
import { _createModel, _createOpenProject, _getSignedDataUrls } from 'lib/client/mutations/core';
import { useUrl } from 'lib/client/hooks';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { hashFileSystem } from 'lib/utils/hashFileSystem';
import { hashPayload } from 'lib/utils/hashPayload';
import { isValidPayload } from 'lib/utils/isValidPayload';
import { deepMergeProject } from 'lib/utils/deepMerge';
import { useSWRConfig } from 'swr';

export const useProject = () => {
  const session = useSession();
  const { mutate } = useSWRConfig();
  const doesStateExist = useRecoilValue(doesStateExistSelector);
  const setProject = useSetRecoilState(projectAtom);
  const setLoading = useSetRecoilState(showLoadingAtom);
  const url = useUrl();
  // const setShowQtViewer = useSetRecoilState(showQtViewerAtom);

  const callETL = useCallback(
    async (axis: webTypes.constants.AXIS, column: any, project, isFilter: boolean) => {
      const deepMerge = deepMergeProject(axis, column, project);

      // if invalid payload, only update project
      if (!isValidPayload(deepMerge.state.properties)) {
        console.log('invalid payload', deepMerge);
        // only update project
        api({
          ..._updateProjectState(deepMerge._id, deepMerge.state),
          onSuccess: () => {
            mutate(`/api/project/${deepMerge._id}`);
          },
        });
      } else {
        const payloadHash = hashPayload(hashFileSystem(project.files), deepMerge);

        // if state exists, download immediately, else call glyphengine
        if (doesStateExist) {
          setLoading(
            produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
              draft.processName = 'Fetching Data...';
            })
          );
          console.dir({ msg: 'state already exists call', payloadHash, project }, { depth: null });
          api({
            ..._getSignedDataUrls(project?.workspace._id.toString(), project?._id.toString(), payloadHash),
            onSuccess: async (data) => {
              mutate(`/api/project/${deepMerge._id}`);
              setLoading({});
              if (window?.core) {
                window?.core?.OpenProject(_createOpenProject(data, project, session, url));
              }
            },
            onError: () => {
              setLoading(
                produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
                  draft.processName = 'Failed to Open Model';
                  draft.processStatus = databaseTypes.constants.PROCESS_STATUS.FAILED;
                  draft.processEndTime = new Date();
                })
              );
            },
          });
        } else {
          // Generate model if doesn't already exist
          setLoading(
            produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
              draft.processName = 'Generating Data Model...';
              draft.processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
              draft.processStartTime = new Date();
            })
          );
          console.dir({ msg: 'create new model call', payloadHash, project }, { depth: null });
          // call glyph engine
          await api({
            ..._createModel(axis, column, project, isFilter, payloadHash),
            silentFail: true,
            onSuccess: (data) => {
              mutate(`/api/project/${deepMerge._id}`);
              setLoading(
                produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
                  draft.processName = 'Fetching Data...';
                })
              );
              api({
                ..._getSignedDataUrls(project?.workspace._id.toString(), project?._id.toString(), payloadHash),
                onSuccess: async (data) => {
                  mutate(`/api/project/${deepMerge._id}`);
                  setLoading({});
                  if (window?.core) {
                    window?.core?.OpenProject(_createOpenProject(data, project, session, url));
                  }
                },
                onError: () => {
                  setLoading(
                    produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
                      draft.processName = 'Failed to Open Model';
                      draft.processStatus = databaseTypes.constants.PROCESS_STATUS.FAILED;
                      draft.processEndTime = new Date();
                    })
                  );
                },
              });
            },
            onError: () => {
              setLoading(
                produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
                  draft.processName = 'Failed to Generate Model';
                  draft.processStatus = databaseTypes.constants.PROCESS_STATUS.FAILED;
                  draft.processEndTime = new Date();
                })
              );
            },
          });
        }
      }
      setLoading({});
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleDrop = useCallback(
    (axis: webTypes.constants.AXIS, column: any, project: webTypes.IHydratedProject, isFilter: boolean) => {
      // we can compose these for a one liner
      callETL(axis, column, project, isFilter);
      setProject(
        produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
          draft.state.properties[`${axis}`].key = column.key;
          draft.state.properties[`${axis}`].dataType = column.dataType;
        })
      );
    },
    [callETL, setProject]
  );

  return {
    handleDrop,
  };
};
