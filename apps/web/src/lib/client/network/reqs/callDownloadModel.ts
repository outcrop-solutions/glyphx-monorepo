import { databaseTypes } from 'types';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { _createOpenProject, _getSignedDataUrls } from '../../mutations';
import api from '../api';

export const callDownloadModel = async ({ project, payloadHash, session, url, setLoading, setDrawer, setResize }) => {
  setLoading(
    produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
      draft.processName = 'Fetching Data...';
    })
  );
  await api({
    ..._getSignedDataUrls(project?.workspace._id.toString(), project?._id.toString(), payloadHash),
    onSuccess: (data) => {
      if (window?.core) {
        setResize(150);
        setDrawer(true);
        window?.core?.OpenProject(_createOpenProject(data, project, session, url, false));
        setLoading({});
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
