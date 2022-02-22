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

        let sorted = sortArray(projectList, {
          by: "updatedAt",
          order: 'desc'
        });
        console.log({ sorted });
        setProjects((prev) => {
          let newData = [...projectList];
          return newData;
        });
        // } else {
        //   console.log("No User");
        // }
      } catch (error) {
        console.log("error on fetching projects", error);
      }
    };
    // if (user && user.attributes)
    fetchProjects();
  }, [user, isLoggedIn]);
  return { projects, setProjects };
};
