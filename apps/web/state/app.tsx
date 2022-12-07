import { atom, selector } from 'recoil';

// UI STATE

// TRACK QT OPEN/CLOSE
export const isQtOpenAtom = atom({
  key: 'isQtOpen',
  default: false,
});
// TOGGLE GRID/LIST IN OVERVIEW
export const isGridViewAtom = atom({
  key: 'isGridView',
  default: true,
});
// TOGGLE SPLIT PANE ORIENTATINO
export const orientationAtom = atom({
  key: 'orientation',
  default: 'horizontal',
});
// TOGGLE MAINSIDEBAR EXPAND
export const isMainSidebarExpandedAtom = selector({
  key: 'isMainSidebarExpanded',
  get: ({ get }) => {
    const selectedProject = get(selectedProjectSelector);
    return !!selectedProject;
  },
});
// TOGGLE ADD PROJECT MODAL
export const showAddProjectAtom = atom({
  key: 'showAddProject',
  default: false,
});
// TOGGLE DATA GRID LOADING
export const dataGridLoadingAtom = atom({
  key: 'dataGridLoading',
  default: false,
});
// TOGGLE LOADING INDICATOR ON MODEL CREATION
export const modelCreationLoadingAtom = atom({
  key: 'modelCreationLoading',
  default: false,
});
// ATOM HOLDING GRID ERROR MODAL DETAILS
export const GridModalErrorAtom = atom({
  key: 'gridErrorModal',
  default: {
    show: false,
    title: 'SAMPLE',
    message: 'SAMPLE',
    devError: 'SAMPLE',
  },
});
// ATOM HOLDS PROGRESS OF ANYTHING
export const progressDetailAtom = atom({
  key: 'progressDetail',
  default: {
    progress: 100,
    total: 100,
  },
});
// RETURNS PROGRESS IN PERCENTAGE STRING FORM
export const progressDetailSelector = selector({
  key: 'progressDetailValue',
  get: ({ get }) => {
    const progress = get(progressDetailAtom);
    return `${Math.round(progress.progress / progress.total) * 100}%`;
  },
});
// GLYPHVIEWER POSITION
export const glyphViewerDetailsAtom = atom({
  key: 'glyphViewerDetails',
  default: {
    commentsPosition: null,
    filterSidebarPosition: null,
    sendDrawerPositionApp: false,
  },
});


// DATA

// PROJECT BY ORG
export const projectsAtom = atom({
  key: 'projects',
  default: [],
});

// holds state of currently selected project
export const selectedProjectAtom = atom({
  key: 'selectedProject',
  default: {
    name: "",
    slug: null,
    description: "",
    sdtPath: null,
    isTemplate: false,


  }
});

// holds state of currently selected project details
export const selectedProjectDetailsAtom = atom({
  key: 'selectedProjectDetails',
  default: null,
});

export const sdtValue = atom({
  key: 'sdtValue',
  default: null,
});

// extracts Qt payload for opening a project from currently selected project
export const payloadSelector = selector({
  key: 'payload',
  get: ({ get }) => {
    const selectedProject = get(selectedProjectSelector);

    console.log('getting payload from payload selector');
    console.log('selectedProject in payload selector:', { selectedProject });

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
    console.log('Setting new selectedProjectSelector:', { newSelectedProjectValue });
    set(selectedProjectSelector, newSelectedProjectValue);
    set(sdtValue, sdt);
  },
});

// null | "uploading" | "processing" | "ready"

export const projectDetailsAtom = atom({
  key: 'projectDetails',
  default: null,
});
