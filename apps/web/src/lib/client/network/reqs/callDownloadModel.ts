import {databaseTypes} from 'types';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {_createOpenProject} from '../../mutations';
import {signDataUrls} from 'actions';

export const callDownloadModel = async ({project, payloadHash, session, url, setLoading, setDrawer, setResize}) => {
  setLoading(
    produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
      draft.processName = 'Fetching Data...';
    })
  );
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
          []
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
