import { useCallback, useEffect, useState } from "react";
import { API, graphqlOperation, Auth } from "aws-amplify";
import { getProject, listProjects } from "graphql/queries";
import { GetProjectQuery, ListProjectsQuery } from "API";
import update from "immutability-helper";
import dayjs from "dayjs";
import sortArray from "sort-array";
/**
 * Utility for interfacing with the Project class
 * @param {Project} project
 * @returns {Object}
 * projects - {Array}
 * setProjects - {function}
 */

export const useProject = (project, sdt, setSdt, projectId) => {
  // Project State
  const [data, setData] = useState(project || null);
  // Project Fork
  const [reorderConfirm, setReorderConfirm] = useState(false);

  // DnD State
  const [propertiesArr, setPropertiesArr] = useState([
    { axis: "X", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    { axis: "Y", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    { axis: "Z", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    { axis: "1", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    { axis: "2", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    { axis: "3", accepts: "COLUMN_DRAG", lastDroppedItem: null },
  ]);
  const [droppedProps, setDroppedProps] = useState([]);
  const [oldDropped, setOldDropped] = useState([]);
  const [url, setUrl] = useState(false);

  // DnD utilities
  const isDropped = (propName) => {
    return droppedProps?.indexOf(propName) > -1;
  };

  const handleDrop = useCallback(
    (index, item) => {
      let dropped = [];

      dropped = project?.properties
        .map((el) => {
          return el.split("-")[0];
        })
        .filter((el) => el !== "");

      const { key } = item;
      setOldDropped(droppedProps?.length > 0 ? droppedProps : dropped);
      setDroppedProps(update(droppedProps, { [index]: { $set: key } }));
      // TODO:
      setPropertiesArr(
        update(propertiesArr, {
          [index]: {
            lastDroppedItem: {
              $set: item,
            },
          },
        })
      );
    },
    [droppedProps, propertiesArr, project]
  );

  // hydrate Project State
  useEffect(() => {
    if (project) setData(project);
  }, [project]);

  // hydrate Functional State
  useEffect(() => {
    if (project) {
      let dropped = project?.properties
        .map((el) => {
          return el.split("-")[0];
        })
        .filter((el) => el !== "");

      // TODO: change this to columns property
      setPropertiesArr((prev) => {
        if (project?.properties && project?.properties.length > 0) {
          const existingProps = project?.properties.map((el, idx) => {
            switch (idx) {
              case 0:
                return {
                  axis: "X",
                  accepts: "COLUMN_DRAG",
                  lastDroppedItem:
                    el === ""
                      ? null
                      : {
                          id: el.split("-")[2],
                          key: el.split("-")[0],
                          dataType: el.split("-")[1],
                        },
                };

              case 1:
                return {
                  axis: "Y",
                  accepts: "COLUMN_DRAG",
                  lastDroppedItem:
                    el === ""
                      ? null
                      : {
                          id: el.split("-")[2],
                          key: el.split("-")[0],
                          dataType: el.split("-")[1],
                        },
                };

              case 2:
                return {
                  axis: "Z",
                  accepts: "COLUMN_DRAG",
                  lastDroppedItem:
                    el === ""
                      ? null
                      : {
                          id: el.split("-")[2],
                          key: el.split("-")[0],
                          dataType: el.split("-")[1],
                        },
                };

              case 3:
                return {
                  axis: "1",
                  accepts: "COLUMN_DRAG",
                  lastDroppedItem:
                    el === ""
                      ? null
                      : {
                          id: el.split("-")[2],
                          key: el.split("-")[0],
                          dataType: el.split("-")[1],
                        },
                };

              case 4:
                return {
                  axis: "2",
                  accepts: "COLUMN_DRAG",
                  lastDroppedItem:
                    el === ""
                      ? null
                      : {
                          id: el.split("-")[2],
                          key: el.split("-")[0],
                          dataType: el.split("-")[1],
                        },
                };

              case 5:
                return {
                  axis: "3",
                  accepts: "COLUMN_DRAG",
                  lastDroppedItem:
                    el === ""
                      ? null
                      : {
                          id: el.split("-")[2],
                          key: el.split("-")[0],
                          dataType: el.split("-")[1],
                        },
                };

              default:
                break;
            }
          });
          return existingProps;
        } else {
          const cleanProps = [
            { axis: "X", accepts: "COLUMN_DRAG", lastDroppedItem: null },
            { axis: "Y", accepts: "COLUMN_DRAG", lastDroppedItem: null },
            { axis: "Z", accepts: "COLUMN_DRAG", lastDroppedItem: null },
            { axis: "1", accepts: "COLUMN_DRAG", lastDroppedItem: null },
            { axis: "2", accepts: "COLUMN_DRAG", lastDroppedItem: null },
            { axis: "3", accepts: "COLUMN_DRAG", lastDroppedItem: null },
          ];
          return cleanProps;
        }
      });
      setSdt(project?.filePath ? project?.filePath : false);
      setUrl(project?.url ? project?.url : false);
      setOldDropped([...dropped]);
      console.log({ dropped });
      setReorderConfirm(false);
      setDroppedProps([]);
    }
  }, [project]);

  // handle ETL
  useEffect(() => {
    // Formatted variables
    let propsArr = propertiesArr.filter((item) => item.lastDroppedItem);
    let filteredArr = propertiesArr
      .slice(3)
      .filter((item) => item.lastDroppedItem);
    let propsSliced = propsArr
      .slice(0, 3)
      .map((item) => item.lastDroppedItem.key);
    let oldDroppedSliced = oldDropped.slice(0, 3).filter((el) => el);
    let droppedSliced = droppedProps.slice(0, 3).filter((el) => el);

    // utilties
    const equals = (a, b) =>
      a.length === b.length && a.every((v, i) => v === b[i]);
    const isPropsValid = () => {
      if (
        propsArr &&
        propsArr.length >= 3 &&
        propsSliced &&
        propsSliced.length >= 3 &&
        droppedSliced &&
        droppedSliced.length >= 3 &&
        equals(propsSliced, droppedSliced)
      ) {
        return true;
      } else {
        return false;
      }
    };

    const doesKeyExist = async () => {
      try {
        const data = await Storage.list(`${project.id}/output/`);
        console.log({ data });
        if (
          data
            .map((el) => el.key)
            .includes(`${project.id}/output/_etl_data_lake.csv`)
        ) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.log({ error });
      }
    };
    const updateProjectState = async (res) => {
      if (res.statusCode === 200) {
        setIsQtOpen(true);
        setUrl(res.url);
        setSdt(res.sdt);

        // update Dynamo Project Item
        const updateProjectInput = {
          id: project.id,
          filePath: res.sdt,
          expiry: new Date().toISOString(),
          properties: propertiesArr.map((el) =>
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
        project &&
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
            model_id: project.id,
            x_axis: propertiesArr[0].lastDroppedItem.key,
            y_axis: propertiesArr[1].lastDroppedItem.key,
            z_axis: propertiesArr[2].lastDroppedItem.key,
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
      project,
      projectId: projectId,
      propsValid: isPropsValid(),
    });
    if (projectId && isPropsValid()) {
      handleETL();
    }
  }, [propertiesArr, project]);

  useEffect(() => {
    console.log({ propertiesArr });
  }, [propertiesArr]);

  // handle Open project
  useEffect(() => {
    console.log({ url, sdt, project });
    if (project && window && window.core) {
      if (url) {
        window?.core.OpenProject(JSON.stringify(url));
      } else {
        window?.core.OpenProject({});
      }
    }
  }, [sdt, url, project]);

  // handle close project drawer
  useEffect(() => {
    // @ts-ignore
    if (reorderConfirm && window && window.core) {
      // @ts-ignore
      window.core.ToggleDrawer(false);
    }
  }, [reorderConfirm]);

  useEffect(() => {
    setData(project);
  }, [project]);

  const fetchProject = useCallback(async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const response = (await API.graphql(graphqlOperation(getProject))) as {
        data: GetProjectQuery;
      };
      let newData = response.data.getProject;
      setData(newData);
    } catch (error) {
      console.log("error on fetching projects", error);
    }
  }, [project]);

  return {
    project: data,
    setProject: setData,
    reorderConfirm,
    setReorderConfirm,
    propertiesArr,
    setPropertiesArr,
    droppedProps,
    setDroppedProps,
    isDropped,
    handleDrop,
  };
};
