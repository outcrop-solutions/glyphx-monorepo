import { atom, selector, selectorFamily } from "recoil";
import { GetProjectQuery } from "API";
import { API, graphqlOperation } from "aws-amplify";
import { getProject } from "graphql/queries";

export const projectIdAtom = atom({
  key: "projectId",
  default: null,
});
// holds state of currently selected project
export const selectedProjectSelector= selector({
  key: "selectedProject",
  get: async ({ get }) => {
    const project = await API.graphql(
      graphqlOperation(getProject, { id: get(projectIdAtom) })
    );
    return project;
  },
  set: ({ set }, project) => {
    set(projectIdAtom, project.id);
  },
});

// holds state of currently selected project details
export const selectedProjectDetailsAtom = atom({
  key: "selectedProjectDetails",
  default: null,
});

export const payloadSelector = selector({
  key: "payload",
  get: ({ get }) => {
    let selectedProject = get(selectedProjectSelector);
    // @ts-ignore
    if (!selectedProject) return { url: null, sdt: null };
    return { url: selectedProject.filePath, sdt: selectedProject.filePath };
  },
  set: ({ set, get }, { sdt, url }: { sdt: any; url: any }) => {
    // @ts-ignore
    let selectedProject = get(selectedProjectSelector);
    let newSelectedProjectValue = {
      ...selectedProject,
      url: url,
      filePath: sdt,
    };

    set(selectedProjectSelector, newSelectedProjectValue);
  },
});

export const projectDetailsAtom = atom({
  key: "projectDetails",
  default: null,
});
