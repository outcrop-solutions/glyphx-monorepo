import {useCallback} from 'react';
import {useSession} from 'next-auth/react';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {webTypes} from 'types';
import {_updateProjectState} from 'lib/client';
import {doesStateExistSelector, drawerOpenAtom, projectAtom, showLoadingAtom, splitPaneSizeAtom} from 'state';
import {_createModel, _getSignedDataUrls} from 'lib/client/mutations/core';
import {useUrl} from 'lib/client/hooks';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {hashFileSystem} from 'lib/utils/hashFileSystem';
import {hashPayload} from 'lib/utils/hashPayload';
import {isValidPayload} from 'lib/utils/isValidPayload';
import {deepMergeProject} from 'lib/utils/deepMerge';
import {useSWRConfig} from 'swr';
import {callUpdateProject} from 'lib/client/network/reqs/callUpdateProject';
import {callCreateModel} from 'lib/client/network/reqs/callCreateModel';
import {callDownloadModel} from 'lib/client/network/reqs/callDownloadModel';

export const useProject = () => {
  const session = useSession();
  const {mutate} = useSWRConfig();
  const doesStateExist = useRecoilValue(doesStateExistSelector);
  const setResize = useSetRecoilState(splitPaneSizeAtom);
  const setProject = useSetRecoilState(projectAtom);
  const setDrawer = useSetRecoilState(drawerOpenAtom);
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
        callUpdateProject(deepMerge, mutate);
        // if model currently generated and downloaded, open project
      } else if (isCurrentlyLoaded) {
        if (window?.core) {
          setResize(150);
          setDrawer(true);
          window?.core?.ToggleDrawer(true);
        }
      } else if (doesStateExist) {
        callUpdateProject(deepMerge, mutate);
        await callDownloadModel({
          project: deepMerge,
          payloadHash,
          session,
          url,
          setLoading,
          setDrawer,
          setResize,
        });
      } else {
        // creates update in route via deepMerge
        await callCreateModel({
          isFilter,
          project: deepMerge,
          payloadHash,
          session,
          url,
          setLoading,
          setDrawer,
          setResize,
          mutate,
        });
      }
      setLoading({});
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /**
   * Checks wether to run glyph engine or not when dealign with templated proejcts
   * @param axis //the prop value that has changed
   * @param properties // the existing project properties before being updated
   * @returns
   */
  const checkOtherPropValues = (axis: webTypes.constants.AXIS, project: webTypes.IHydratedProject): boolean => {
    let retval = false;
    // reassign
    let existingProps = {...project.state.properties};
    const template = project?.template;

    // delete axis
    delete existingProps[axis];
    const keys = Object.keys(existingProps);

    for (const key of keys) {
      const prop = existingProps[key];
      // if not "third drop", don't run glyphengine
      if (prop.key === template?.shape[prop.axis].key) {
        retval = true;
      }
    }

    return retval;
  };

  const handleDrop = useCallback(
    (axis: webTypes.constants.AXIS, column: any, project: webTypes.IHydratedProject, isFilter: boolean) => {
      // existing prop value
      const prop = {
        ...project?.state.properties[`${axis}`],
      };

      const isNotFull = checkOtherPropValues(axis, project);

      if (prop.key === project?.template?.shape[prop.axis].key && isNotFull) {
        setProject(
          produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
            draft.state.properties[`${axis}`].key = column.key;
            draft.state.properties[`${axis}`].dataType = column.dataType;
          })
        );
      } else {
        // we can compose these for a one liner
        callETL(axis, column, project, isFilter);
        setProject(
          produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
            draft.state.properties[`${axis}`].key = column.key;
            draft.state.properties[`${axis}`].dataType = column.dataType;
          })
        );
      }
    },
    [callETL, setProject]
  );

  return {
    handleDrop,
  };
};
