import { useState, useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { listStates } from "../graphql/queries";

/**
 * Utility for interfacing with the States class
 * @param {Object} project
 * @returns {Object}
 * states - {Array}
 * setStates - {function}
 * state - {Array}
 * setState - {function}
 * deleteState - {function}
 */

export const useStates = (project) => {
  const [state, setState] = useState(null);
  const [states, setStates] = useState([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const statesData = await API.graphql(graphqlOperation(listStates));

        //@ts-ignore
        const stateList = statesData?.data.listStates.items;

        console.log({ stateList });
        setStates((prev) => {
          let newData = [
            ...stateList.filter((el) => el.projectID === project.id),
          ];
          return newData;
        });
      } catch (error) {
        console.log("error on fetching states", error);
      }
    };
    if (project) fetchStates();
  }, [project]);
  return {
    states,
    state,
    setStates: (arg) => {
      setStates((prev) => {
        console.log({ arg: [...prev, arg] });
        return [...prev, arg];
      });
    },
    setState: (arg) => {
      setState((prev) => {
        return arg;
      });
    },
    deleteState: (arg) => {
      setStates((prev) => {
        let newData = prev.filter((st) => st.id !== arg.id);
        return newData;
      });
    },
  };
};
