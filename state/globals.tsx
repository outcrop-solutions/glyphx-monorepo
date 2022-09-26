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
import { selectedProjectSelector } from "./project";
// holds project list for given user/org combo
export const projectsAtom = atom({
  key: "projects",
  default: [],
});

// holds current org
// TODO: to be set via a [orgId] wildcard route
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

// to be used to keep track of Qt toggle state
export const isQtOpenAtom = atom({
  key: "isQtOpen",
  default: false,
});

// split pane orientation
export const orientationAtom = atom({
  key: "orientation",
  default: "horizontal",
});

// keeps track of main sidebar expansion
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

// 
export const toastAtom = atom({
  key: "toastAtom",
  default: "",
});

export const dataGridLoadingAtom = atom({
  key: "dataGridLoading",
  default: false,
});
