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

import { atom, selector } from "recoil";
import { selectedProjectAtom } from "./project";
// holds project list for given user/org combo
export const projectsAtom = atom({
  key: "projects",
  default: [],
});

// holds current org
export const currentOrgAtom = atom({
  key: "currentOrg",
  default: {},
});

// toggles grid vs list in overview
export const isGridViewAtom = atom({
  key: "isGridView",
  default: false,
});

// toggles grid vs list in overview
export const isMainSidebarExpandedAtom = selector({
  key: "isMainSidebarExpanded",
  get: ({ get }) => {
    const selectedProject = get(selectedProjectAtom);
    return !!selectedProject;
  },
});

// toggles add project modal
export const showAddProjectAtom = atom({
  key: "showAddProject",
  default: false,
});

// toggles reorder confirmation modal
export const showReorderConfirmAtom = atom({
  key: "showAddProject",
  default: false,
});
