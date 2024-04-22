import {databaseTypes} from 'types';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {_createOpenProject} from '../../mutations';
import {signDataUrls} from 'actions';
import {isNullCamera} from 'lib/utils/isNullCamera';

export const callDownloadModel = async ({
  project,
  payloadHash,
  session,
  url,
  setLoading,
  setDrawer,
  setResize,
  camera = {},
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
  // setLoading(
  //   produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
  //     draft.processName = 'Downloading model...';
  //   })
  // );
  const isNullCam = isNullCamera(camera);
  const retval = await signDataUrls(project?.workspace.id, project?.id, payloadHash);
  if (!retval?.error) {
    if (window?.core) {
      setResize(150);
      setDrawer(true);
      window?.core?.OpenProject(
        _createOpenProject(
          retval as {
            sdtUrl: any;
            sgcUrl: any;
            sgnUrl: any;
          },
          project,
          session,
          url,
          false,
          [],
          isNullCam ? undefined : camera
        )
      );
      setLoading({});
    }
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
