import { useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import update from 'immutability-helper';
import {
  droppedPropertiesSelector,
  createModelPayloadSelector,
  propertiesSelector,
  projectAtom,
  showModelCreationLoadingAtom,
  canCallETL,
  showQtViewerAtom,
  workspaceAtom,
} from 'state';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { _createModel, api } from 'lib/client';
import { compose } from 'utils/compose';
/**
 * Utility for interfacing with the Project class
 * @returns {Object}
 * isDropped - {function}
 * handleDrop - {function}
 */

export const useProject = () => {
  // user session
  const { data } = useSession();
  const userId = data?.user?.userId;

  // project state
  const [project, setProject] = useRecoilState(projectAtom);
  const workspace = useRecoilState(workspaceAtom);
  const properties = useRecoilValue(propertiesSelector);
  const droppedProps = useRecoilValue(droppedPropertiesSelector);
  const createModelPayload = useRecoilValue(createModelPayloadSelector);

  // ui state
  const setModelCreationLoadingState = useSetRecoilState(showModelCreationLoadingAtom);
  const setShowQtViewer = useSetRecoilState(showQtViewerAtom);

  // DnD utilities
  const isDropped = (propName) => {
    return droppedProps?.indexOf(propName) > -1;
  };

  // TODO: update handle drop to use curried version of immer produce
  const handleDrop = useCallback(
    (index, item) => {
      setProject(
        update(properties, {
          [index]: {
            lastDroppedItem: {
              $set: item,
            },
          },
        })
      );
    },
    [properties, setProject]
  );

  // handle ETL
  useEffect(() => {
    const callETL = async () => {
      // window?.core?.ToggleDrawer(false);
      if (canCallETL) {
        api({
          ..._createModel(createModelPayload),
          onSuccess: (response) => {
            window?.core?.OpenProject(
              JSON.stringify({
                userId: userId,
                projectId: project?._id,
                workspaceId: workspace?.id,
                sdtUrl: '',
                sgnUrl: '',
                sgcUrl: '',
              }),
              false
            );
          },
          // setLoading: compose(setModelCreationLoadingState, showQtViewerAtom),
        });
      }
    };
    callETL();
  }, [createModelPayload, project?._id, setModelCreationLoadingState, userId, workspace?.id]);

  return {
    isDropped,
    handleDrop,
  };
};
