'use client';
import produce from 'immer';
import {databaseTypes} from 'types';
import {WritableDraft} from 'immer/dist/internal';
import {_createOpenProject} from 'lib/client/mutations';
import {glyphEngine, signDataUrls} from 'actions';

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

    if (!retval?.error) {
      setLoading(
        produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
          draft.processName = 'Fetching Data...';
        })
      );
      // sign data urls
      if (project.id) {
        const signedUrls = await signDataUrls(project.id);
        // @ts-ignore
        if (!signedUrls?.error) {
          if (window?.core) {
            setResize(150);
            setDrawer(true);
            window?.core?.OpenProject(
              _createOpenProject(signedUrls as {sdtUrl: any; sgcUrl: any; sgnUrl: any}, project, session, url, true, [])
            );
            setLoading({});
            setImageHash({
              imageHash: false,
            });
            setCamera({});
          }
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
        setImageHash({
          imageHash: false,
        });
        setCamera({});
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
      setImageHash({
        imageHash: false,
      });
      setCamera({});
    }
  } catch (error) {
    console.log({error});
  }
};
