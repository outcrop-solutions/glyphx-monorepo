import { atom, selector } from "recoil";

// holds state of currently selected project
export const selectedProjectAtom = atom({
  key: "selectedProject",
  default: {},
});

export const payloadSelector = selector({
  key: "payload",
  get: ({ get }) => {
    let selectedProject = get(selectedProjectAtom);
    // @ts-ignore
    return { url: selectedProject.url, sdt: selectedProject.sdt };
  },
  set: ({ set, get }, { sdt, url }: { sdt: any; url: any }) => {
    // @ts-ignore
    let selectedProject = get(selectedProjectAtom);
    let newSelectedProjectValue = {
      ...selectedProject,
      url: url,
      sdt: sdt,
    };

    set(selectedProjectAtom, newSelectedProjectValue);
  },
});

export const membersSelector = selector({
  key: "members",
  get: ({ get }) => {
    let selectedProject = get(selectedProjectAtom);
    // @ts-ignore
    return selectedProject.members;
  },
  set: ({ set, get }, newMembersValue) => {
    // @ts-ignore
    let selectedProject = get(selectedProjectAtom);
    let newSelectedProjectValue = {
      ...selectedProject,
      members: [...newMembersValue],
    };

    set(selectedProjectAtom, newSelectedProjectValue);
  },
});
