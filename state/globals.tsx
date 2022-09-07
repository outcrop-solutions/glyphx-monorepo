// ATOMS
// current org
// selectedProject
// selectedProject
// selectedState
// selectedFile

// isFileLoading
// isAppLoading
// isETLRunning
// commentsVisible

// ATOM FAMILIES
// projects

// SELECTOR FAMILY
// selectedProject --> files
// selectedProject --> properties
// selectedProject --> states
// selectedProject --> comments
// selectedProject --> payload (for sending to open project)
// selectedProject --> members
// selectedFIle --> dataGrid

import { ListProjectsQuery } from "API";
import { API, Auth, graphqlOperation } from "aws-amplify";
import { listProjects } from "graphql/queries";
import { atom, selector } from "recoil";
import { selectedProjectSelector } from "./project";
import { userSelector } from "./user";
// holds project list for given user/org combo
export const projectsSelector = selector({
  key: "projects",
  get: async ({ get }) => {
    // const user = get(userSelector(userData));
    const user = await Auth.currentAuthenticatedUser();
    if (user) {
      try {
        const response = await API.graphql(graphqlOperation(listProjects));
        return response;
      } catch (error) {
        console.log({ error });
      }
    } else return null;
  },
  set: (_, newValue) => {
    return newValue;
  },
});

// holds current org
export const currentOrgAtom = atom({
  key: "currentOrg",
  default: null,
});

// toggles grid vs list in overview
export const isGridViewAtom = atom({
  key: "isGridView",
  default: false,
});

export const isQtOpenAtom = atom({
  key: "isQtOpen",
  default: false,
});

// toggles grid vs list in overview
export const isMainSidebarExpandedAtom = selector({
  key: "isMainSidebarExpanded",
  get: ({ get }) => {
    const selectedProject = get(selectedProjectSelector);
    return !!selectedProject;
  },
});

// toggles add project modal
export const showAddProjectAtom = atom({
  key: "showAddProject",
  default: false,
});

export const toastAtom = atom({
  key: "toastAtom",
  default: "",
});
