import { useState, useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { listStates } from "../graphql/queries";

export const useStates = (project) => {
  const [state, setState] = useState(null);
  const [states, setStates] = useState([]);
  const fetchStates = async () => {
  	try {
  		const stateData = await API.graphql(graphqlOperation(listStates))
  		const stateList = stateData.data.listStates.items

  		console.log({ stateList })
  		setState(stateList[0])
  		setStates((prev) => {
  			let newData = [...stateList]
  			return newData
  		})
  	} catch (error) {
  		console.log('error on fetching states', error)
  	}
  }
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
