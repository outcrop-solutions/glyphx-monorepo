import produce from 'immer';
import api from '../api';
import { database as databaseTypes } from '@glyphx/types';
import { WritableDraft } from 'immer/dist/internal';
import { _createModel, _createOpenProject, _getSignedDataUrls } from 'lib/client/mutations';

export const callCreateModel = async ({
  isFilter,
  project,
  payloadHash,
  session,
  url,
  setLoading,
  setDrawer,
  setResize,
  mutate,
}) => {
  // Generate model if doesn't already exist
  setLoading(
    produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
      draft.processName = 'Generating Data Model...';
      draft.processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
      draft.processStartTime = new Date();
    })
  );
  // call glyph engine
  await api({
    ..._createModel(project, isFilter, payloadHash),
    silentFail: true,
    onSuccess: (data) => {
      mutate(`/api/project/${project._id}`);
      setLoading(
        produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
          draft.processName = 'Fetching Data...';
        })
      );
      api({
        ..._getSignedDataUrls(project?.workspace._id.toString(), project?._id.toString(), payloadHash),
        onSuccess: async (data) => {
          mutate(`/api/project/${project._id}`);
          setLoading({});
          if (window?.core) {
            setResize(150);
            setDrawer(true);
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
};