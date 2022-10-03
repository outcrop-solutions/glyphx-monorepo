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
  dataGridLoadingAtom,
  AxisInterpolationAtom,
  AxisDirectionAtom
} from "../state";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { updateProject } from "graphql/mutations";
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

  const [dataGridState, setDataGridState] = useRecoilState(dataGridLoadingAtom);

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
    // console.log("in handle etl useffect")
    // utilties
    const updateProjectState = async (res) => {
      if (res.statusCode === 200) {
        setIsQtOpen(true);
        setPayload((prev) => ({ url: res.url, sdt: res.sdt }));
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
        } catch (error) {
          // TODO: put error handling in toast
          console.log({ error });
        }
      }
    };
    const callETL = async () => {
      if (isZnumber) {
        if (isPropsValid) {
          console.log("calling etl");
          setDataGridState(true);
          // call ETl endpoint for second half of ETL pipeline
          try {
            let response = await fetch("https://adj71mzk16.execute-api.us-east-2.amazonaws.com/default/sgx-api-build-model", {
            method: "POST",
            mode: "no-cors",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model_id: selectedProject.id, // Model Name
              x_axis : droppedProps[0].lastDroppedItem.key, // X-axis name
              y_axis : droppedProps[1].lastDroppedItem.key, // Y-axis name
              z_axis : droppedProps[2].lastDroppedItem.key, // Z-axis name
              user_id : userId, // AWS Cognito UserID
              x_func : interpolation.X, // X-axis Interpolation
              y_func : interpolation.Y, // y-axis Interpolation
              z_func : interpolation.Z, // Z-axis Interpolation
              x_direction : direction.X, // X-axis Interpolation
              y_direction : direction.Y, // y-axis Interpolation
              z_direction : direction.Z // Z-axis Interpolation
            }),
          });
          let res = await response.json();
          await updateProjectState(res);
          } catch (error) {
            console.log("Something went wrong with 2nd ETL Call",{error})
          }
          setDataGridState(false);
        }
        else{
          console.log("Props not valid")
        }
      } else {
        console.log("Z-Axis is not number")
        setToast(
          "Z-Axis must be a column with numbers or of numeric data type. UNABLE TO CREATE MODULE"
        );
        // FIXME: not sure this is correct @johnathan
        // properties.pop(); //remove the z axis from there
        setTimeout(() => {
          setToast("");
        }, 3000);
      }
    };
    callETL();
  }, [properties, selectedProject,interpolation,direction]);

  // handle Open project
  useEffect(() => {
    // console.log("in handle open project useeffect")
    // @ts-ignore
    if (selectedProject && window && window.core) {
      if (payload.url) {
        // @ts-ignore
        window?.core.OpenProject(JSON.stringify(payload.url));
      } else {
        // @ts-ignore
        window?.core.OpenProject({});
      }
    }
  }, [payload, selectedProject]);

  // handle close project drawer
  useEffect(() => {
    // @ts-ignore
    if (reorderConfirm && window && window.core) {
      // @ts-ignore
      window.core.ToggleDrawer(false);
    }
  }, [reorderConfirm]);

  return {
    isDropped,
    handleDrop,
  };
};
