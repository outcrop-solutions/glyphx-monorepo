import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSetRecoilState } from 'recoil';
import { web as webTypes, database as databaseTypes } from '@glyphx/types';
import { api } from 'lib/client';

import { projectAtom, showModelCreationLoadingAtom } from 'state';
import { updateDrop } from 'lib/client/actions/updateProp';
import { _createModel, _createOpenProject, _getSignedDataUrls } from 'lib/client/mutations/core';
import { useUrl } from 'lib/client/hooks';

export const useProject = () => {
  const session = useSession();
  const setProject = useSetRecoilState(projectAtom);
  const url = useUrl();
  // ui state
  const setModelCreationLoadingState = useSetRecoilState(showModelCreationLoadingAtom);
  // const setShowQtViewer = useSetRecoilState(showQtViewerAtom);

  const callETL = useCallback(
    async (axis: webTypes.constants.AXIS, column: any, project, isFilter: boolean) => {
      // call glyph engine
      await api({
        ..._createModel(axis, column, project, isFilter),
        silentFail: true,
        onSuccess: (data) => {
          api({
            ..._getSignedDataUrls(project?.workspace._id.toString(), project?._id.toString()),
            onSuccess: async (data) => {
              if (window.core) {
                const camera = await window.core.GetCameraPosition(true);
                window?.core?.OpenProject(_createOpenProject(data, project, session, url, camera));
              }
            },
          });
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleDrop = useCallback(
    (axis: webTypes.constants.AXIS, column: any, project: databaseTypes.IProject, isFilter: boolean) => {
      // we can compose these for a one liner
      callETL(axis, column, project, isFilter);
      setProject(updateDrop(axis, column));
    },
    [callETL, setProject]
  );

  return {
    handleDrop,
  };
};
