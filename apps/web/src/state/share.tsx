import { atom, selector } from "recoil";
import { selectedProjectSelector } from "./project";

export const shareOpenAtom = atom({
  key: "shareOpen",
  default: false,
});

export const membersSelector = selector({
  key: "members",
  get: ({ get }) => {
    let selectedProject = get(selectedProjectSelector);
    // @ts-ignore
    return selectedProject.members;
  },
  set: ({ set, get }, newMembersValue) => {
    // @ts-ignore
    let selectedProject = get(selectedProjectSelector);
    let newSelectedProjectValue = {
      ...selectedProject,
      members: [...newMembersValue],
    };

    set(selectedProjectSelector, newSelectedProjectValue);
  },
});
