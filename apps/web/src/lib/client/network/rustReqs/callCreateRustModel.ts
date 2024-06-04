'use client';
import produce from 'immer';
import {databaseTypes} from 'types';
import {WritableDraft} from 'immer/dist/internal';
import {glyphEngine, signDataUrls} from 'actions';

export const callCreateModel = async ({project, payloadHash, setLoading, setDrawer, setResize}) => {
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

    if (!retval?.error) {
      setLoading(
        produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
          draft.processName = 'Fetching Data...';
        })
      );
      // sign data urls
      const signedUrls = await signDataUrls(project?.workspace.id, project?.id, payloadHash);

      if (!signedUrls?.error) {
        setLoading({});

        setResize(150);
        setDrawer(true);
        // TODO: pass in complete vectors to the model
      } else {
        setLoading(
          produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
            draft.processName = 'Failed to Open Model';
            draft.processStatus = databaseTypes.constants.PROCESS_STATUS.FAILED;
            draft.processEndTime = new Date();
          })
        );
      }
    } else {
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
