import { atom, selector } from "recoil";
import { selectedProjectSelector } from "./project";
import { activeStateAtom } from "./states";

export const commentsOpenAtom = selector({
  key: "commentsOpen",
  get: ({ get }) => {
    const activeState = get(activeStateAtom);
    return !!activeState;
  },
  set: (_, newValue) => {
    if (newValue) return newValue;
    else return false;
  },
});

export const commentsSelector = selector({
  key: "comments",
  get: ({ get }) => {
    let selectedProject = get(selectedProjectSelector);
    if (selectedProject === undefined) return;
    // @ts-ignore
    return selectedProject?.comments?.items;
  },
  set: ({ set, get }, newCommentsValue) => {
    // @ts-ignore
    let selectedProject = get(selectedProjectSelector);
    if (selectedProject === undefined) return;
    let newSelectedProjectValue = {
      ...selectedProject,
      comments: [...newCommentsValue],
    };

    set(selectedProjectSelector, newSelectedProjectValue);
  },
});
