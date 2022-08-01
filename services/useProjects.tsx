import { useCallback, useEffect, useState } from "react";
import { API, graphqlOperation, Auth } from "aws-amplify";
import { listProjects } from "graphql/queries";
import { useUser } from "./useUser";
import sortArray from "sort-array";
import { ListProjectsQuery } from "API";

/**
 * Utility for interfacing with the Projects class
 * @param {boolean} isLoggedIn
 * @returns {Object}
 * projects - {Array}
 * setProjects - {function}
 */

export const useProjects = (projects) => {
  // const { user, setUser, isLogged } = useUser();
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(projects && projects.length > 0 ? [...projects] : []);
  }, [projects]);

  const fetchProjects = useCallback(async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const response = (await API.graphql(graphqlOperation(listProjects))) as {
        data: ListProjectsQuery;
      };
      const filtered = response.data.listProjects.items.filter(
        (el) => el?.shared?.includes(user.username) || el.author === user.id
      );
      let sorted = sortArray(filtered, {
        by: "updatedAt",
        order: "desc",
      });

      setData((prev) => {
        let newData = [...sorted];
        return newData;
      });
    } catch (error) {
      console.log("error on fetching projects", error);
    }
    // }, [user, setUser, isLogged]);
  }, [projects]);
  console.log({ projects: data });
  return { projects: data, setProjects: setData, fetchProjects };
};
