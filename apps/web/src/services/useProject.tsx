import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSetRecoilState } from 'recoil';
import { web as webTypes, database as databaseTypes } from '@glyphx/types';
import { api } from 'lib/client';
import { projectAtom, showLoadingAtom } from 'state';
import { _createModel, _createOpenProject, _getSignedDataUrls } from 'lib/client/mutations/core';
import { useUrl } from 'lib/client/hooks';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { hashFileSystem } from 'lib/utils/hashFileSystem';

export const useProject = () => {
  const session = useSession();
  const setProject = useSetRecoilState(projectAtom);
  const setLoading = useSetRecoilState(showLoadingAtom);
  const url = useUrl();
  // const setShowQtViewer = useSetRecoilState(showQtViewerAtom);

  const callETL = useCallback(
    async (axis: webTypes.constants.AXIS, column: any, project, isFilter: boolean) => {
      setLoading(
        produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
          draft.processName = 'Generating Data Model...';
          draft.processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
          draft.processStartTime = new Date();
        })
      );
      const fileHash = hashFileSystem(project.files);
      // call glyph engine
      await api({
        ..._createModel(axis, column, project, isFilter, fileHash),
        silentFail: true,
        onSuccess: (data) => {
          setLoading(
            produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
              draft.processName = 'Fetching Data...';
            })
          );
          api({
            ..._getSignedDataUrls(project?.workspace._id.toString(), project?._id.toString(), fileHash),
            onSuccess: async (data) => {
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
