'use client';
import produce from 'immer';
import {databaseTypes} from 'types';
import {WritableDraft} from 'immer/dist/internal';
import {_createOpenProject} from 'lib/client/mutations';
import {glyphEngine} from 'actions';
import {isNullCamera} from 'lib/utils/isNullCamera';

export const callGlyphEngine = async ({
  project,
  session,
  url,
  setLoading,
  setImageHash,
  setCamera,
  setDrawer,
  setResize,
  isCreate = false,
  stateId,
  rowIds = [],
  camera = {},
}: {
  project: databaseTypes.IProject;
  session: any;
  url: string;
  setLoading: any;
  setImageHash: any;
  setCamera: any;
  setDrawer: any;
  setResize: any;
  isCreate?: boolean;
  stateId?: string;
  rowIds?: any[];
  camera?: any;
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
    const retval = await glyphEngine(cleanProject, stateId);
    // open the project
    // @ts-ignore
    if (!retval?.error) {
      if (window?.core) {
        setLoading({});
        setResize(150);
        setDrawer(true);
        const isNullCam = isNullCamera(camera);
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
