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
  dataGridLoadingAtom
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
  // console.log({selectedProject})
  const [properties, setProperties] = useRecoilState(propertiesAtom);
  const [payload, setPayload] = useRecoilState(payloadSelector);

  const isPropsValid = useRecoilValue(isPropsValidSelector);
  const isZnumber = useRecoilValue(isZnumberSelector);

  const setToast = useSetRecoilState(toastAtom);

  const userId = useRecoilValue(userIdSelector);
  // console.log({userId});

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
    console.log("in handle etl useffect")
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
      // console.log({isZnumber});
      // console.log({properties});
      if (isZnumber) {
      // if(properties[2]?.lastDroppedItem?.dataType === "number"){
        
        if (isPropsValid) {
          console.log("calling etl");
          setDataGridState(true);
          // console.log({selectedProject})
          // call ETl endpoint for second half of ETL pipeline
          try {
            let response = await fetch("https://adj71mzk16.execute-api.us-east-2.amazonaws.com/default/sgx-api-build-model", {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify({
              model_id: selectedProject.id,
              x_axis: droppedProps[0].lastDroppedItem.key,
              y_axis: droppedProps[1].lastDroppedItem.key,
              z_axis: droppedProps[2].lastDroppedItem.key,
              user_id: userId,
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
  }, [properties, selectedProject]);

  // handle Open project
  useEffect(() => {
    console.log("in handle open project useeffect")
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
