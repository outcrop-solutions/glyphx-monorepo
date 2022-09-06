import { atom, selector } from "recoil";
import { selectedProjectAtom } from "./project";

export const shareOpenAtom = atom({
  key: "shareOpen",
  default: false,
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
