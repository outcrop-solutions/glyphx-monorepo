import {databaseTypes} from 'types';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {signDataUrls} from 'actions';
import {isNullCamera} from 'lib/utils/isNullCamera';

export const callDownloadModel = async ({
  project,
  payloadHash,
  setLoading,
  setDrawer,
  setResize,
}: {
  project: any;
  payloadHash: string;
  session: any;
  url: string;
  setLoading: any;
  setDrawer: any;
  setResize: any;
  camera?: any;
}) => {
  setLoading(
    produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
      draft.processName = 'Fetching Data...';
    })
  );
  const retval = await signDataUrls(project?.workspace.id, project?.id, payloadHash);
  if (!retval?.error) {
    setResize(150);
    // open project
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
