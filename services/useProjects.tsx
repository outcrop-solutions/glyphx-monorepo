import { useEffect, useState } from "react";
import { API, graphqlOperation, Auth } from "aws-amplify";
import { listProjects } from "../graphql/queries";
import { useUser } from "./useUser";
import sortArray from "sort-array";

/**
 * Utility for interfacing with the Projects class
 * @param {boolean} isLoggedIn
 * @returns {Object}
 * projects - {Array}
 * setProjects - {function}
 */

export const useProjects = ({ isLoggedIn }) => {
  const { user, setUser, isLogged } = useUser();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (user) {
          const projectData = await API.graphql(graphqlOperation(listProjects));

          const projectList = projectData.data.listProjects.items;
          const filtered = projectList.filter((el) =>
            el.shared
              ? el.shared.includes(user.username)
              : el.author === user.id
          );
          let sorted = sortArray(filtered, {
            by: "updatedAt",
            order: "desc",
          });

          setProjects((prev) => {
            let newData = [...filtered];
            return newData;
          });
        } else {
          throw "no user";
        }
      } catch (error) {
        console.log("error on fetching projects", error);
      }
    };
    if (user && user.attributes) {
      fetchProjects();
    }
  }, [user, setUser, isLogged]);
  return { projects, setProjects };
};
