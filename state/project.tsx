import { atom, selector, selectorFamily } from "recoil";
import { GetProjectQuery } from "API";
import { API, graphqlOperation } from "aws-amplify";
import { getProject } from "graphql/queries";
import {userAtom } from "./user";

export const projectIdAtom = atom({
  key: "projectId",
  default: null,
});

// holds state of currently selected project
export const selectedProjectSelector = selector({
  key: "selectedProject",
  get: async ({ get }) => {
    const user = get(userAtom);
    const projectId = get(projectIdAtom);
    if (user && projectId) {
      console.log("Attempting to get selectedProjectSelector");
      try {
        const response = (await API.graphql(
          graphqlOperation(getProject, { id: projectId })
        )) as {
          data: GetProjectQuery;
        };
        return response.data.getProject;
      } catch (error) {
        console.log({ error, recoil: "selectedProjectSelector" });
      }
    } else return null;
  },
  set: ({ set, get }, id) => {
    console.log("New project id passed in",{id})
    if (id === null || id === undefined) {
      set(projectIdAtom, null);
    }else{
      set(projectIdAtom, id["id"]);
    }
    
  },
});

// holds state of currently selected project details
export const selectedProjectDetailsAtom = atom({
  key: "selectedProjectDetails",
  default: null,
});

export const sdtValue = atom({
  key:"sdtValue",
  default : null
})

// extracts Qt payload for opening a project from currently selected project
export const payloadSelector = selector({
  key: "payload",
  get: ({ get }) => {
    const selectedProject = get(selectedProjectSelector);

    console.log("getting payload from payload selector")
    console.log("selectedProject in payload selector:",{selectedProject})
    
    if (!selectedProject) return { url: null, sdt: null };
    return { url: selectedProject.url, sdt: selectedProject.filePath };
  },
  set: ({ set, get }, { sdt, url }: { sdt: any; url: any }) => {
    // @ts-ignore
    let selectedProject = get(selectedProjectSelector);
    let newSelectedProjectValue = {
      ...selectedProject,
      url: url,
      filePath: sdt,
    };
    console.log("Setting new selectedProjectSelector:",{newSelectedProjectValue})
    set(selectedProjectSelector, newSelectedProjectValue);
    set(sdtValue,sdt);
  },
});

// null | "uploading" | "processing" | "ready"

export const projectDetailsAtom = atom({
  key: "projectDetails",
  default: null,
});


