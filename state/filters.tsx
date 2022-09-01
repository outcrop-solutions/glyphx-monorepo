import { selector } from "recoil";
import { selectedProjectAtom } from "./project";

export const filtersSelector = selector({
  key: "filters",
  get: ({ get }) => {
    let selectedProject = get(selectedProjectAtom);
    // @ts-ignore
    return selectedProject.filters.items;
  },
  set: ({ set, get }, newFitlersValue) => {
    // @ts-ignore
    let selectedProject = get(selectedProjectAtom);
    let newSelectedProjectValue = {
      ...selectedProject,
      fitlers: [...newFitlersValue],
    };

    set(selectedProjectAtom, newSelectedProjectValue);
  },
});
