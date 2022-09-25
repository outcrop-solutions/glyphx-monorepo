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
import { API, graphqlOperation } from "aws-amplify";
import { listProjects } from "graphql/queries";
import { atom, selector } from "recoil";
import { selectedProjectSelector } from "./project";
import { userSelector } from "./user";
// holds project list for given user/org combo
export const projectsSelector = selector({
  key: "projects",
  get: async ({ get }) => {
    const user = get(userSelector);
    console.log({ user });
    // const user = await Auth.currentAuthenticatedUser();
    if (user) {
      try {
        // TODO: ASK JAMES HOW TO LOCK QUERY TO PROJECTS OWNED BY USER OR SHARED TO USER
        const response = (await API.graphql(
          graphqlOperation(listProjects)
        )) as {
          data: ListProjectsQuery;
        };
        return response.data.listProjects.items.sort( //this little bit here sorts the data in relation to latest update date :)
          (objA, objB) => Date.parse(objB.updatedAt) - Date.parse(objA.updatedAt)
        );
      } catch (error) {
        console.log({ error, cool: "" });
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

// UI STATE

// toggles grid vs list in overview
export const isGridViewAtom = atom({
  key: "isGridView",
  default: true,
});

export const isQtOpenAtom = atom({
  key: "isQtOpen",
  default: false,
});

export const orientationAtom = atom({
  key: "orientation",
  default: "horizontal",
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

export const dataGridLoadingAtom = atom({
  key: "dataGridLoading",
  default: false,
});
