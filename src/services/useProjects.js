import { useEffect, useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { listProjects } from "../graphql/queries";
import { useUser } from "../services/useUser";

export const useProjects = () => {
  const { user } = useUser();
  console.log({ user });
  const [projects, setProjects] = useState([]);
  // fetch project data from RDS
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectData = await API.graphql(graphqlOperation(listProjects));
        // console.log({ projectData })
        const projectList = projectData.data.listProjects.items;

        console.log({ projectList })
        setProjects((prev) => {
          let newData = [...projectList];
          return newData;
        });
      } catch (error) {
        console.log("error on fetching projects", error);
      }
    };
    if (user && user.attributes) fetchProjects();
  }, [user]);
  return { projects };
};
