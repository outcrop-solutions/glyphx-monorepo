import { atom, selector } from "recoil";
import { selectedProjectAtom } from "./project";

export const commentsOpenAtom = atom({
  key: 'commentsOpen',
  default: false
})

export const commentsSelector = selector({
    key: "comments",
    get: ({ get }) => {
      let selectedProject = get(selectedProjectAtom);
      // @ts-ignore
      return selectedProject.comments.items;
    },
    set: ({ set, get }, newCommentsValue) => {
      // @ts-ignore
      let selectedProject = get(selectedProjectAtom);
      let newSelectedProjectValue = {
        ...selectedProject,
        comments: [...newCommentsValue],
      };
  
      set(selectedProjectAtom, newSelectedProjectValue);
    },
  });