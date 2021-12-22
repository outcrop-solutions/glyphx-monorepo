import { useState, useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { listStates } from "../graphql/queries";

export const useStates = (project) => {
  const [state, setState] = useState(null);
  const [states, setStates] = useState([]);

  useEffect(() => {
    if (project && project.states.items) {
      setStates(project.states.items);
    }
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
  };
};
