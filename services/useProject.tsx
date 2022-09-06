import { useCallback, useEffect, useState } from "react";
import { API, graphqlOperation, Auth } from "aws-amplify";
import { getProject, listProjects } from "graphql/queries";
import { GetProjectQuery, ListProjectsQuery } from "API";
import update from "immutability-helper";
import dayjs from "dayjs";
import sortArray from "sort-array";
import {
  isPropsValidSelector,
  isQtOpenAtom,
  payloadSelector,
  propertiesSelector,
  selectedProjectAtom,
  showReorderConfirmAtom,
} from "../state";
import { useRecoilState, useRecoilValue } from "recoil";
/**
 * Utility for interfacing with the Project class
 * @param {Project} project
 * @returns {Object}
 * projects - {Array}
 * setProjects - {function}
 */

export const useProject = (projectId) => {
  const [reorderConfirm, setReorderConfirm] = useRecoilState(
    showReorderConfirmAtom
  );
  const [isQtOpen, setIsQtOpen] = useRecoilState(isQtOpenAtom);
  const selectedProject = useRecoilValue(selectedProjectAtom);
  const [payload, setPayload] = useRecoilState(payloadSelector);
  const [properties, setProperties] = useRecoilState(propertiesSelector);

  const [droppedProps, setDroppedProps] = useState([]);
  const [oldDropped, setOldDropped] = useState([]);

  // DnD utilities
  const isDropped = (propName) => {
    return droppedProps?.indexOf(propName) > -1;
  };

  const handleDrop = useCallback(
    (index, item) => {
      let dropped = [];

      dropped = selectedProject?.properties
        .map((el) => {
          return el.split("-")[0];
        })
        .filter((el) => el !== "");

      const { key } = item;
      setOldDropped(droppedProps?.length > 0 ? droppedProps : dropped);
      setDroppedProps(update(droppedProps, { [index]: { $set: key } }));
      // TODO:
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
    [droppedProps, properties, selectedProject]
  );

  // handle ETL
  useEffect(() => {
    // Formatted variables
    let propsArr = properties.filter((item) => item.lastDroppedItem);
    let filteredArr = properties
      .slice(3)
      .filter((item) => item.lastDroppedItem);
    let propsSliced = propsArr
      .slice(0, 3)
      .map((item) => item.lastDroppedItem.key);
    let oldDroppedSliced = oldDropped.slice(0, 3).filter((el) => el);
    let droppedSliced = droppedProps.slice(0, 3).filter((el) => el);

    // utilties

    const isPropsValid = useRecoilValue(isPropsValidSelector);

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
          console.log({ error });
        }
      }
      // TODO: add error handling
    };
    const callETl = async (propsArr, filteredArr) => {
      console.log("callEtl");
      if (
        selectedProject &&
        window &&
        window.core &&
        propsArr &&
        propsArr.length >= 3
      ) {
        console.log("call endpoint");
        // call ETl endpoint
        let response = await fetch("https://api.glyphx.co/etl/model", {
          method: "POST",
          mode: "cors",
          body: JSON.stringify({
            model_id: selectedProject.id,
            x_axis: properties[0].lastDroppedItem.key,
            y_axis: properties[1].lastDroppedItem.key,
            z_axis: properties[2].lastDroppedItem.key,
            filters: filteredArr,
          }),
        });
        let res = await response.json();
        await updateProjectState(res);
      }
    };
    const handleETL = async () => {
      console.log("handle etl");
      // TODO: track which properties come from which file keys once we add file delete funcitonality to ensure we don't run etl on non existent keys
      // check if file exists in s3 to prevent running ETL on non-existent keys
      let isSafe = await doesKeyExist();
      if (isSafe) {
        await callETl(propsArr, filteredArr);
      } else {
        setError(
          "File not available to ETL yet. Please wait and try again once the file has finished uploading"
        );
        setTimeout(() => {
          setError(false);
        }, 3000);
        console.log({ error: `File not available to ETL yet ${isSafe}` });
      }
    };
    // If reordering props, create new model
    if (
      oldDropped &&
      oldDroppedSliced.length === 3 &&
      !equals(propsSliced, oldDroppedSliced)
    ) {
      console.log("Called Reorder Confirm");
      setReorderConfirm(true);
      return;
    }
    // handle initial ETL
    console.log({
      selectedProject,
      projectId: projectId,
      propsValid: isPropsValid,
    });
    if (projectId && isPropsValid) {
      handleETL();
    }
  }, [properties, selectedProject]);

  // handle Open project
  useEffect(() => {
    console.log({ payload, selectedProject });
    if (selectedProject && window && window.core) {
      if (payload.url) {
        window?.core.OpenProject(JSON.stringify(payload.url));
      } else {
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
