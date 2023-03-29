import { useCallback, useEffect } from 'react';
import update from 'immutability-helper';
import {
  droppedPropertiesSelector,
  isPropsValidSelector,
  showQtViewerAtom,
  isZnumberSelector,
  propertiesAtom,
  projectAtom,
  showModelCreationLoadingAtom,
  AxisInterpolationAtom,
  AxisDirectionAtom,
  selectedFileAtom,
} from 'state';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { createModelCall } from './create-model';
import { formatColumnHeader } from 'utils/Utils';
import { useSession } from 'next-auth/react';
/**
 * Utility for interfacing with the Project class
 * @returns {Object}
 * isDropped - {function}
 * handleDrop - {function}
 */

export const useProject = () => {
  const setIsQtOpen = useSetRecoilState(showQtViewerAtom);
  const project = useRecoilValue(projectAtom);

  const [properties, setProperties] = useRecoilState(propertiesAtom);

  const isPropsValid = useRecoilValue(isPropsValidSelector);
  const isZnumber = useRecoilValue(isZnumberSelector);

  const userId = useSession().data.user.userId;
  const interpolation = useRecoilValue(AxisInterpolationAtom);
  const direction = useRecoilValue(AxisDirectionAtom);

  const droppedProps = useRecoilValue(droppedPropertiesSelector);
  const selectedFile = useRecoilValue(selectedFileAtom);

  const setModelCreationLoadingState = useSetRecoilState(showModelCreationLoadingAtom);

  // DnD utilities
  const isDropped = (propName) => {
    return droppedProps?.indexOf(propName) > -1;
  };

  const handleDrop = useCallback(
    (index, item) => {
      const { key } = item;
      setProperties(
        update(properties, {
          [index]: {
            lastDroppedItem: {
              $set: item,
            },
          },
        })
      );
    },
    [properties, setProperties]
  );

  // handle ETL
  useEffect(() => {
    // utilties
    const updateProjectState = async (res) => {
      // if (res?.statusCode === 200) {
      setIsQtOpen(true);
      // update Dynamo Project Item
      const updateProjectInput = {
        id: project._id,
        filePath: res.sdt,
        expiry: new Date().toISOString(),
        properties: properties.map((el) =>
          el.lastDroppedItem
            ? el.lastDroppedItem.key
              ? `${el.lastDroppedItem.key}-${el.lastDroppedItem.dataType}-${el.lastDroppedItem.id}`
              : ''
            : ''
        ),
        url: res.url,
      };
      try {
        // const result = await API.graphql(
        //   graphqlOperation(updateProject, { input: updateProjectInput })
        // );
      } catch (error) {
        // TODO: put error handling in toast
      }
      // }
    };
    const callETL = async () => {
      if (droppedProps?.length === 3 && project?._id) {
        if (isZnumber) {
          if (isPropsValid) {
            try {
              //hide existing model
              window?.core.ToggleDrawer(false);
            } catch (error) {}

            setModelCreationLoadingState(true);

            // call ETl endpoint for second half of ETL pipeline
            try {
              let response = await createModelCall(
                project?._id,
                {
                  X: formatColumnHeader(droppedProps[0].lastDroppedItem.key),
                  Y: formatColumnHeader(droppedProps[1].lastDroppedItem.key),
                  Z: formatColumnHeader(droppedProps[2].lastDroppedItem.key),
                },
                userId,
                interpolation,
                direction
              );
              if (response?.errorMessage) {
                // if there was an error
              } else {
                await updateProjectState({
                  url: `s3://glyphx-model-output-bucket/${userId}/${project?.id}/`,
                  cache: false,
                  sdt: `${project?._id}`,
                }); // on success send data to payload
                try {
                  // create glyph window
                  window.core.OpenProject(
                    JSON.stringify({
                      user_id: userId,
                      model_id: project?._id,
                    }),
                    false
                  );
                } catch (error) {}
              }
            } catch (error) {
              setGridErrorModal({
                show: true,
                title: 'Fatal Error',
                message: 'Failed to create Model',
                devError: error.message,
              });
            }
            setModelCreationLoadingState(false);
          } else {
          }
        } else {
          setGridErrorModal({
            show: true,
            title: 'Z-Axis Error',
            message: 'Z-Axis must be a column with numbers or of numeric data type. UNABLE TO CREATE MODULE',
            devError: 'N/A',
          });
        }
      }
    };
    callETL();
  }, [
    properties,
    project,
    interpolation,
    direction,
    setIsQtOpen,
    droppedProps,
    isZnumber,
    isPropsValid,
    setModelCreationLoadingState,
    userId,
  ]);

  return {
    isDropped,
    handleDrop,
  };
};
