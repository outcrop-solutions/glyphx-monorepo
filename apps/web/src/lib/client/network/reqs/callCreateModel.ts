'use client';
import produce from 'immer';
import { databaseTypes } from 'types';
import { WritableDraft } from 'immer/dist/internal';
import { _createOpenProject } from 'lib/client/mutations';
import { glyphEngine, signDataUrls } from 'actions';
import { callDownloadModel } from './callDownloadModel';

export const callCreateModel = async ({
  project,
  session,
  url,
  setLoading,
  setImageHash,
  setCamera,
  setDrawer,
  setResize,
}: {
  project: databaseTypes.IProject;
  session: any;
  url: string;
  setLoadingisFilter?: boolean;
  setLoading: any;
  setDrawer: any;
  setImageHash: any;
  setCamera: any;
  setResize: any;
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
    const retval = await glyphEngine(cleanProject);
    //  download it
    if (!retval?.error) {
      console.log('called download model in callCreateModel')
      await callDownloadModel({
        project,
        session,
        url,
        isCreate: true,
        setLoading,
        setDrawer,
        setResize,
        setImageHash,
        setCamera,
      });
    } else {
      setLoading(
        produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
          draft.processName = 'Failed to Generate Model';
          draft.processStatus = databaseTypes.constants.PROCESS_STATUS.FAILED;
          draft.processEndTime = new Date();
        })
      );
      setImageHash({
        imageHash: false,
      });
      setCamera({});
    }
  } catch (error) {
    console.log({ error });
  }
};
