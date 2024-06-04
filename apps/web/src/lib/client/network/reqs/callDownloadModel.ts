import {databaseTypes} from 'types';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {signDataUrls} from 'actions';

export const callDownloadModel = async ({
  project,
  payloadHash,
  session,
  url,
  setLoading,
  setDrawer,
  camera = {},
}: {
  project: any;
  payloadHash: string;
  session: any;
  url: string;
  setLoading: any;
  setDrawer: any;
  camera?: any;
}) => {
  const retval = await signDataUrls(project?.workspace.id, project?.id, payloadHash);
  if (!retval?.error) {
    setDrawer(true);
    setLoading({});
  } else {
    setLoading(
      produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
        draft.processName = 'Failed to Open Model';
        draft.processStatus = databaseTypes.constants.PROCESS_STATUS.FAILED;
        draft.processEndTime = new Date();
      })
    );
  }
};
