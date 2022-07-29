import { useCallback, useEffect, useState } from "react";
import { API, graphqlOperation, Auth } from "aws-amplify";
import { getProject, listProjects } from "graphql/queries";
import { useUser } from "./useUser";
import sortArray from "sort-array";
import { GetProjectQuery, ListProjectsQuery } from "API";

/**
 * Utility for interfacing with the Project class
 * @param {Project} project
 * @returns {Object}
 * projects - {Array}
 * setProjects - {function}
 */

export const useProject = (project) => {
  // const { user, setUser, isLogged } = useUser();
  const [data, setData] = useState(project || null);

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

  return { project: data, setProject: setData, fetchProject };
};
