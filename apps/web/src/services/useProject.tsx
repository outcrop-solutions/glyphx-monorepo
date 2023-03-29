import { useCallback, useEffect } from 'react';
import update from 'immutability-helper';
import {
  droppedPropertiesSelector,
  showQtViewerAtom,
  createModelPayloadSelector,
  propertiesSelector,
  projectAtom,
  showModelCreationLoadingAtom,
  canCallETL,
} from 'state';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useSession } from 'next-auth/react';
import { api } from 'lib';
import { _createModel } from 'lib/client/mutations/core';
/**
 * Utility for interfacing with the Project class
 * @returns {Object}
 * isDropped - {function}
 * handleDrop - {function}
 */

export const useProject = () => {
  // user session
  const { data } = useSession();
  const userId = data.user.userId;

  // project state
  const [project, setProject] = useRecoilState(projectAtom);
  const properties = useRecoilValue(propertiesSelector);
  const droppedProps = useRecoilValue(droppedPropertiesSelector);
  const createModelPayload = useRecoilValue(createModelPayloadSelector);

  // ui state
  const setModelCreationLoadingState = useSetRecoilState(showModelCreationLoadingAtom);

  // DnD utilities
  const isDropped = (propName) => {
    return droppedProps?.indexOf(propName) > -1;
  };

  // TODO: update handle drop to use recoil
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
      window?.core.ToggleDrawer(false);
      if (canCallETL) {
        api({
          ..._createModel(createModelPayload),
          onSuccess: (response) => {
            window.core.OpenProject(
              JSON.stringify({
                user_id: userId,
                model_id: project?._id,
              }),
              false
            );
          },
          setLoading: setModelCreationLoadingState,
        });
      }
    };
    callETL();
  }, [createModelPayload, project?._id, setModelCreationLoadingState, userId]);

  return {
    isDropped,
    handleDrop,
  };
};
