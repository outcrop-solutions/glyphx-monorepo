import { useCallback, useEffect, useState } from "react";
import { API, graphqlOperation, Auth } from "aws-amplify";
import update from "immutability-helper";
import {
  droppedPropertiesSelector,
  isPropsValidSelector,
  isQtOpenAtom,
  isZnumberSelector,
  payloadSelector,
  propertiesAtom,
  selectedProjectSelector,
  showReorderConfirmAtom,
  toastAtom,
  userIdSelector,
  modelCreationLoadingAtom,
  AxisInterpolationAtom,
  AxisDirectionAtom,
  GridModalErrorAtom,
  progressDetailAtom,
  selectedFileAtom
} from "../state";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { updateProject } from "graphql/mutations";
import { createModelCall } from "./ETLCalls";
import { formatColumnHeader } from "@/utils/Utils";
/**
 * Utility for interfacing with the Project class
 * @returns {Object}
 * isDropped - {function}
 * handleDrop - {function}
 */

export const useProject = () => {
  const [reorderConfirm, setReorderConfirm] = useRecoilState(
    showReorderConfirmAtom
  );
  const setIsQtOpen = useSetRecoilState(isQtOpenAtom);
  const selectedProject = useRecoilValue(selectedProjectSelector);

  const [properties, setProperties] = useRecoilState(propertiesAtom);
  const [payload, setPayload] = useRecoilState(payloadSelector);

  const isPropsValid = useRecoilValue(isPropsValidSelector);
  const isZnumber = useRecoilValue(isZnumberSelector);

  const setToast = useSetRecoilState(toastAtom);

  const userId = useRecoilValue(userIdSelector);
  const interpolation = useRecoilValue(AxisInterpolationAtom);
  const direction = useRecoilValue(AxisDirectionAtom);

  const droppedProps = useRecoilValue(droppedPropertiesSelector);
  const selectedFile = useRecoilValue(selectedFileAtom);

  const setModelCreationLoadingState = useSetRecoilState(modelCreationLoadingAtom);
  const setGridErrorModal = useSetRecoilState(GridModalErrorAtom);
  const setProgress = useSetRecoilState(progressDetailAtom);

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
    [properties, selectedProject]
  );

  // handle ETL
  useEffect(() => {
    console.log("in first use effect")
    // utilties
    const updateProjectState = async (res) => {
      // if (res?.statusCode === 200) {
        setIsQtOpen(true);
        setPayload({ url: res.url, sdt: res.sdt });
        // update Dynamo Project Item
        const updateProjectInput = {
          id: selectedProject.id,
          filePath: res.sdt,
          expiry: new Date().toISOString(),
          properties: properties.map((el) =>
            el.lastDroppedItem
              ? el.lastDroppedItem.key
                ? `${el.lastDroppedItem.key}-${el.lastDroppedItem.dataType}-${el.lastDroppedItem.id}`
                : ""
              : ""
          ),
          url: res.url,
        };
        try {
          const result = await API.graphql(
            graphqlOperation(updateProject, { input: updateProjectInput })
          );
          console.log({ result });
          console.log({ payload });
        } catch (error) {
          // TODO: put error handling in toast
          console.log({ error });
        }
      // }

    };
    const callETL = async () => {
      console.log({ droppedProps }, { userId });
      console.log({ selectedFile });
      if (droppedProps?.length === 3 && selectedProject?.id) {
        if (isZnumber) {
          if (isPropsValid) {
            console.log("calling etl");
            // try { //close existing model
            //   // @ts-ignore
            //   window?.core.ToggleDrawer(false);
            // } catch (error) {
            //   console.log({ error })
            // }

            setModelCreationLoadingState(true);
            console.log({ selectedProject })
            // call ETl endpoint for second half of ETL pipeline
            try {
              let response = await createModelCall(
                selectedProject?.id,
                {
                  X: formatColumnHeader(droppedProps[0].lastDroppedItem.key),
                  Y: formatColumnHeader(droppedProps[1].lastDroppedItem.key),
                  Z: formatColumnHeader(droppedProps[2].lastDroppedItem.key)
                },
                userId,
                interpolation,
                direction
              );
              console.log({ response });
              if (response?.errorMessage) { // if there was an error
                setGridErrorModal({
                  show: true,
                  title: "Fatal Error",
                  message: "Failed to create Model",
                  devError: response.errorMessage
                });
              }
              else {
                await updateProjectState({
                  url: `s3://glyphx-model-output-bucket/${userId}/${selectedProject?.id}/`,
                  cache: false,
                  sdt: `${selectedProject?.id}`
                }); // on success send data to payload
                try {
                  // create window
                  // @ts-ignore
                  window.core.OpenProject(JSON.stringify({
                    user_id: userId,
                    model_id: selectedProject?.id,
                  }));
                } catch (error) {
                  console.log({ error })
                }
              }
            } catch (error) {
              setGridErrorModal({
                show: true,
                title: "Fatal Error",
                message: "Failed to create Model",
                devError: error.message
              })
              console.log("Something went wrong with 2nd ETL Call", { error })
            }
            setModelCreationLoadingState(false);
          }
          else {
            console.log("Props not valid")
          }
        } else {
          console.log("Z-Axis is not number");
          setGridErrorModal({
            show: true,
            title: "Z-Axis Error",
            message: "Z-Axis must be a column with numbers or of numeric data type. UNABLE TO CREATE MODULE",
            devError: "N/A"
          });
        }
      }
    };
    callETL();
  }, [properties, selectedProject, interpolation, direction]);

  // handle Open project
  // useEffect(() => {
  //   console.log("In second use effect");
  //   // console.log("in handle open project useeffect")
  //   // @ts-ignore
  //   if (selectedProject && window && //window.core) {
  //     if (payload?.url) {
  //       // @ts-ignore
  //       window?.core.OpenProject(JSON.stringify(payload.url));
  //     } else {
  //       // @ts-ignore
  //       window?.core.OpenProject({});
  //     }
  //   }
  // }, [payload, selectedProject]);

  // handle close project drawer
  // useEffect(() => {
  //   console.log("Third useEffect called");
  //   // @ts-ignore
  //   if (reorderConfirm && window && //window.core) {
  //     // @ts-ignore
  //     //window.core.ToggleDrawer(false);
  //   }
  // }, [reorderConfirm]);

  return {
    isDropped,
    handleDrop,
  };
};
