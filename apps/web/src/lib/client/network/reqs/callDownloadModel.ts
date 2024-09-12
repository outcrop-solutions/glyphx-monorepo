import {databaseTypes} from 'types';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {_createOpenProject} from '../../mutations';
import {signDataUrls} from 'actions';
import {isNullCamera} from 'lib/utils/isNullCamera';

export const callDownloadModel = async ({
  project,
  session,
  url,
  setLoading,
  setDrawer,
  setImageHash,
  setCamera,
  setResize,
  isCreate = false,
  stateId,
  rowIds = [],
  camera = {},
}: {
  project: any;
  session: any;
  url: string;
  setLoading: any;
  setDrawer: any;
  setImageHash: any;
  setCamera: any;
  setResize: any;
  isCreate?: boolean;
  stateId?: string;
  rowIds?: any[];
  camera?: any;
}) => {
  // setLoading(
  //   produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
  //     draft.processName = 'Fetching Data...';
  //   })
  // );
  console.log('callDownloadModel', {
    project,
    session,
    url,
    setLoading,
    setDrawer,
    setImageHash,
    setCamera,
    setResize,
    stateId,
    rowIds,
    camera,
  });
  const isNullCam = isNullCamera(camera);
  const retval = await signDataUrls(project?.id, stateId);

  console.log('getDataUrls for download', {retval});
  // @ts-ignore
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
          isCreate,
          rowIds,
          isNullCam ? undefined : camera
        )
      );
    }
  } else {
    setLoading(
      produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
        draft.processName = 'Failed to Open Model';
        draft.processStatus = databaseTypes.constants.PROCESS_STATUS.FAILED;
        draft.processEndTime = new Date();
      })
    );
    setImageHash({
      imageHash: false,
    });
    setCamera({});
  }
  setTimeout(() => setLoading({}), 1000);
};
