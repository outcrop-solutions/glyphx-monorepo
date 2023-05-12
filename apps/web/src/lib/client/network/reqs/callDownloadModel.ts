import { database as databaseTypes } from '@glyphx/types';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { _createOpenProject, _getSignedDataUrls } from '../../mutations';
import api from '../api';

export const callDownloadModel = ({ project, payloadHash, session, url, mutate, setLoading }) => {
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
};
