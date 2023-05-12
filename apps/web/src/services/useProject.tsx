import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { web as webTypes, database as databaseTypes } from '@glyphx/types';
import { _updateProjectState, api } from 'lib/client';
import { doesStateExistSelector, projectAtom, showLoadingAtom } from 'state';
import { _createModel, _createOpenProject, _getSignedDataUrls } from 'lib/client/mutations/core';
import { useUrl } from 'lib/client/hooks';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { hashFileSystem } from 'lib/utils/hashFileSystem';
import { hashPayload } from 'lib/utils/hashPayload';
import { isValidPayload } from 'lib/utils/isValidPayload';
import { deepMergeProject } from 'lib/utils/deepMerge';
import { useSWRConfig } from 'swr';
import { callUpdateProject } from 'lib/client/network/reqs/callUpdateProject';
import { callCreateModel } from 'lib/client/network/reqs/callCreateModel';
import { callDownloadModel } from 'lib/client/network/reqs/calldownloadModel';

export const useProject = () => {
  const session = useSession();
  const { mutate } = useSWRConfig();
  const doesStateExist = useRecoilValue(doesStateExistSelector);
  const setProject = useSetRecoilState(projectAtom);
  const setLoading = useSetRecoilState(showLoadingAtom);
  const url = useUrl();
  // const setShowQtViewer = useSetRecoilState(showQtViewerAtom);

  const callETL = useCallback(
    async (axis: webTypes.constants.AXIS, column: any, project, isFilter: boolean) => {
      const deepMerge = deepMergeProject(axis, column, project);
      const payloadHash = hashPayload(hashFileSystem(project.files), deepMerge);
      const isCurrentlyLoaded = payloadHash === hashPayload(hashFileSystem(project.files), project);
      // if invalid payload, only update project
      if (!isValidPayload(deepMerge.state.properties)) {
        console.dir({ msg: 'update project call', project }, { depth: null });
        callUpdateProject(deepMerge, mutate);
        // if model currently generated and downloaded, open project
      } else if (isCurrentlyLoaded) {
        console.log('is currently loaded, nothing to do');
        if (window?.core) {
          window?.core?.ToggleDrawer(true);
        }
      } else if (doesStateExist) {
        console.dir({ msg: 'download model call', payloadHash, project }, { depth: null });
        callUpdateProject(deepMerge, mutate);
        callDownloadModel({ project: deepMerge, payloadHash, session, url, mutate, setLoading });
      } else {
        console.dir({ msg: 'create new model call', payloadHash, project }, { depth: null });
        // creates update in route via deepMerge
        callCreateModel({ axis, column, isFilter, project, payloadHash, session, url, setLoading, mutate });
      }

      setLoading({});
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleDrop = useCallback(
    (axis: webTypes.constants.AXIS, column: any, project: webTypes.IHydratedProject, isFilter: boolean) => {
      // we can compose these for a one liner
      callETL(axis, column, project, isFilter);
      setProject(
        produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
          draft.state.properties[`${axis}`].key = column.key;
          draft.state.properties[`${axis}`].dataType = column.dataType;
        })
      );
    },
    [callETL, setProject]
  );

  return {
    handleDrop,
  };
};
