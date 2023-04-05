import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import produce from 'immer';
import { web as webTypes } from '@glyphx/types';
import { _createModel, _getSignedDataUrls, api } from 'lib/client';
import { GridColumn } from 'lib/types';

import {
  droppedPropertiesSelector,
  createModelPayloadSelector,
  projectAtom,
  showModelCreationLoadingAtom,
  canCallETL,
  workspaceAtom,
} from 'state';
import { getUrl } from 'config/constants';

export const useProject = () => {
  // user session
  const { data } = useSession();

  // app state
  const workspace = useRecoilValue(workspaceAtom);
  const [project, setProject] = useRecoilState(projectAtom);
  const droppedProps = useRecoilValue(droppedPropertiesSelector);
  const createModelPayload = useRecoilValue(createModelPayloadSelector);

  // ui state
  const setModelCreationLoadingState = useSetRecoilState(showModelCreationLoadingAtom);
  // const setShowQtViewer = useSetRecoilState(showQtViewerAtom);

  // DnD utilities
  const isDropped = (propName) => {
    return droppedProps?.indexOf(propName) > -1;
  };

  const callETL = useCallback(async () => {
    if (canCallETL) {
      // call glyph engine
      await api({
        ..._createModel(createModelPayload),
      });
      // get signed urls
      await api({
        ..._getSignedDataUrls(workspace?._id, project?._id),
        onSuccess: (data) => {
          window?.core?.OpenProject(
            JSON.stringify({
              projectId: project?._id,
              workspaceId: workspace?._id,
              sdtUrl: data.sdturl,
              sgnUrl: data.sgnurl,
              sgcUrl: data.data.sgcurl,
              viewName: project?.viewName,
              apiLocation: `${getUrl()}/api`,
              sessionInformation: data,
            })
          );
        },
      });
    }
  }, [createModelPayload, project, workspace]);

  const handleDrop = useCallback(
    async (axis: webTypes.constants.AXIS, column: GridColumn) => {
      setProject(
        produce((draft) => {
          // @ts-ignore
          draft.state.properties[`${axis}`].key = column.key;
          // @ts-ignore
          draft.state.properties[`${axis}`].dataType = column.dataType;
        })
      );
      if (canCallETL) {
        callETL();
      }
    },
    [callETL, setProject]
  );

  return {
    isDropped,
    handleDrop,
    callETL,
  };
};
