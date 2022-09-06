import { atom, selector } from "recoil";
import { selectedProjectAtom } from "./project";
import { activeStateAtom } from "./states";

export const commentsOpenAtom = selector({
  key: 'commentsOpen',
  get: ({get}) => {
    const activeState = get(activeStateAtom)
    return activeState !== undefined
  }
})

export const commentsSelector = selector({
    key: "comments",
    get: ({ get }) => {
      let selectedProject = get(selectedProjectAtom);
      if (!selectedProject) return;
      // @ts-ignore
      return selectedProject.comments.items;
    },
    set: ({ set, get }, newCommentsValue) => {
      // @ts-ignore
      let selectedProject = get(selectedProjectAtom);
      if (!selectedProject) return;
      let newSelectedProjectValue = {
        ...selectedProject,
        comments: [...newCommentsValue],
      };
  
      set(selectedProjectAtom, newSelectedProjectValue);
    },
  });