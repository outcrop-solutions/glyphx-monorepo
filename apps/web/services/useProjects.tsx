import { useCallback, useEffect } from "react";
import { API, graphqlOperation, Auth } from "aws-amplify";
import Router, { useRouter } from "next/router";
import { listProjects } from "graphql/queries";
import sortArray from "sort-array";
import { ListProjectsQuery } from "API";
import { useSetRecoilState } from "recoil";
import { projectsAtom } from "../state";

/**
 * Utility for interfacing with the Projects class
 * @returns {void}
 */

export const useProjects = () => {
  const router = useRouter();
  // const { user, setUser, isLogged } = useUser();
  const setProjects = useSetRecoilState(projectsAtom);
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

      setProjects((prev) => {
        let newData = [...sorted];
        return newData;
      });
    } catch (error) {
      console.log("error on fetching projects", error);
      router.push("/auth/signIn");
    }
  }, []);
  useEffect(()=>{
    fetchProjects();
  },[])
  
};
