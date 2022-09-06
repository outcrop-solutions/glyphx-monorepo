import { atom, selector } from "recoil";

// holds state of currently selected project
export const selectedProjectAtom = atom({
  key: "selectedProject",
  default: null,
});

// holds state of currently selected project details
export const selectedProjectDetailsAtom = atom({
  key: "selectedProjectDetails",
  default: null,
});

export const payloadSelector = selector({
  key: "payload",
  get: ({ get }) => {
    let selectedProject = get(selectedProjectAtom);
    // @ts-ignore
    if (!selectedProject) return { url: null, sdt: null };
    return { url: selectedProject.filePath, sdt: selectedProject.filePath };
  },
  set: ({ set, get }, { sdt, url }: { sdt: any; url: any }) => {
    // @ts-ignore
    let selectedProject = get(selectedProjectAtom);
    let newSelectedProjectValue = {
      ...selectedProject,
      url: url,
      filePath: sdt,
    };

    set(selectedProjectAtom, newSelectedProjectValue);
  },
});

export const projectDetailsAtom = atom({
  key: "projectDetails",
  default: null,
});
