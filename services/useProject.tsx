import { useCallback, useEffect, useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
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

  const droppedProps = useRecoilValue(droppedPropertiesSelector);

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
          // call ETl endpoint
          let response = await fetch("https://api.glyphx.co/etl/model", {
            method: "POST",
            mode: "cors",
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
        }
      } else {
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
