import { atom, selector } from "recoil";
import { projectAtom } from "./project";

export const membersSelector = selector({
  key: "members",
  get: ({ get }) => {
    let selectedProject = get(projectAtom);
    // @ts-ignore
    return selectedProject.members;
  },
  set: ({ set, get }, newMembersValue) => {
    // @ts-ignore
    let selectedProject = get(projectAtom);
    let newSelectedProjectValue = {
      ...selectedProject,
      members: [...newMembersValue],
    };

    set(projectAtom, newSelectedProjectValue);
  },
});
