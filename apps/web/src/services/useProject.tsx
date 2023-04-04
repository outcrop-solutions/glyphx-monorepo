import { useCallback, useEffect } from 'react';
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

export const useProject = () => {
  // user session
  const { data } = useSession();
  const userId = data?.user?.userId;

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

  const handleDrop = useCallback(
    (axis: webTypes.constants.AXIS, column: GridColumn) => {
      setProject(
        produce((draft) => {
          // @ts-ignore
          draft.state.properties[`${axis}`].key = column.key;
          // @ts-ignore
          draft.state.properties[`${axis}`].dataType = column.dataType;
        })
      );
    },
    [setProject]
  );

  // handle ETL
  useEffect(() => {
    const callETL = async () => {
      console.log({ canCallETL });
      if (canCallETL) {
        // call glyph engine
        // await api({
        //   ..._createModel(createModelPayload),
        // });
        // get signed urls
        // await api({
        //   ..._getSignedDataUrls(workspace?._id, project?._id),
        //   onSuccess: (res) => {
        //     window?.core?.OpenProject(
        //       JSON.stringify({
        //         userId: userId,
        //         projectId: project?._id,
        //         workspaceId: workspace?._id,
        //         sdtUrl: res.data.sdturl,
        //         sgnUrl: res.data.sgnurl,
        //         sgcUrl: res.data.sgcurl,
        //       })
        //     );
        //   },
        // });
      }
    };
    callETL();
  }, [createModelPayload, project?._id, setModelCreationLoadingState, userId, workspace?._id]);

  return {
    isDropped,
    handleDrop,
  };
};
