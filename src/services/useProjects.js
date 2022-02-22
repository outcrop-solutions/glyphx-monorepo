import { useEffect, useState } from "react";
import { API, graphqlOperation, Auth } from "aws-amplify";
import { listProjects } from "../graphql/queries";
import { useUser } from "../services/useUser";
import sortArray from "sort-array";

export const useProjects = ({ isLoggedIn }) => {
  // const { user } = useUser();
  // console.log({ user });
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(false);
  // fetch project data from RDS
  useEffect(() => {
    const fetchUser = async () => {
      const user = await Auth.currentAuthenticatedUser();
      setUser(user);
    };
    fetchUser();
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // if (user) {
        const projectData = await API.graphql(graphqlOperation(listProjects));
        // console.log({ projectData })
        const projectList = projectData.data.listProjects.items;
        const filtered = projectList.filter(
          (el) => el.author === user.username
        );
        let sorted = sortArray(filtered, {
          by: "updatedAt",
          order: "desc",
        });
        console.log({ sorted });
        setProjects((prev) => {
          let newData = [...filtered];
          return newData;
        });
      } catch (error) {
        console.log("error on fetching projects", error);
      }
    };
    // if (user && user.attributes)
    fetchProjects();
  }, [user, isLoggedIn]);
  return { projects, setProjects };
};
