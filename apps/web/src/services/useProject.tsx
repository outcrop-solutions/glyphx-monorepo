import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSetRecoilState } from 'recoil';
import { web as webTypes, fileIngestion as fileIngestionTypes, database as databaseTypes } from '@glyphx/types';
import { api } from 'lib/client';

import { projectAtom, showModelCreationLoadingAtom } from 'state';
import { updateDrop } from 'lib/client/actions/updateProp';
import { getUrl } from 'config/constants';
import { _createModel, _createOpenProject, _getSignedDataUrls } from 'lib/client/mutations/core';

export const useProject = () => {
  const session = useSession();
  const setProject = useSetRecoilState(projectAtom);

  // ui state
  const setModelCreationLoadingState = useSetRecoilState(showModelCreationLoadingAtom);
  // const setShowQtViewer = useSetRecoilState(showQtViewerAtom);

  const callETL = useCallback(
    async (axis: webTypes.constants.AXIS, column: any, project) => {
      // call glyph engine
      await api({
        ..._createModel(axis, column, project),
        silentFail: true,
        onSuccess: (data) => {
          api({
            ..._getSignedDataUrls(project?.workspace._id.toString(), project?._id.toString()),
            onSuccess: (data) => {
              if (window.core) {
                window?.core?.OpenProject(_createOpenProject(data, project, session));
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
    (axis: webTypes.constants.AXIS, column: any, project: databaseTypes.IProject) => {
      // we can compose these for a one liner
      callETL(axis, column, project);
      setProject(updateDrop(axis, column));
    },
    [callETL, setProject]
  );

  return {
    handleDrop,
  };
};
