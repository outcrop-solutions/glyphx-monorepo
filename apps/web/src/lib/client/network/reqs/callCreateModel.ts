'use client';
import produce from 'immer';
import {databaseTypes} from 'types';
import {WritableDraft} from 'immer/dist/internal';
import {_createOpenProject} from 'lib/client/mutations';
import {glyphEngine, signDataUrls} from 'actions';

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
  try {
    // set initial loading state
    setLoading(
      produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
        draft.processName = 'Generating Data Model...';
        draft.processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
        draft.processStartTime = new Date();
      })
    );
    const cleanProject = {
      ...project,
      stateHistory: [],
    };
    // create model
    const retval = await glyphEngine(cleanProject, payloadHash);
    console.dir(retval, {depth: 2});

    if (!retval?.error) {
      setLoading(
        produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
          draft.processName = 'Fetching Data...';
        })
      );
      // sign data urls
      console.log({projectInput: project, payloadHash});
      const signedUrls = await signDataUrls(project?.workspace.id, project?.id, payloadHash);
      console.dir(signedUrls, {depth: 2});

      if (!signedUrls?.error) {
        setLoading({});
        if (window?.core) {
          setResize(150);
          setDrawer(true);
          console.log('calling open project');
          window?.core?.OpenProject(
            _createOpenProject(signedUrls as {sdtUrl: any; sgcUrl: any; sgnUrl: any}, project, session, url, true, [])
          );
        }
      } else {
        console.log('failed to open model');
        setLoading(
          produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
            draft.processName = 'Failed to Open Model';
            draft.processStatus = databaseTypes.constants.PROCESS_STATUS.FAILED;
            draft.processEndTime = new Date();
          })
        );
      }
    } else {
      console.log('failed to generate model');
      setLoading(
        produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
          draft.processName = 'Failed to Generate Model';
          draft.processStatus = databaseTypes.constants.PROCESS_STATUS.FAILED;
          draft.processEndTime = new Date();
        })
      );
    }
  } catch (error) {
    console.log({error});
  }
};
