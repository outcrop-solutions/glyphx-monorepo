import { atom, selector } from "recoil";
import { selectedProjectAtom } from "./project";
// holds state of currently selected state
export const selectedStateAtom = atom({
    key: "selectedState",
    default: {},
      // add atom effect to handle state change via we
  });

  export const statesSelector = selector({
    key: "states",
    get: ({ get }) => {
      let selectedProject = get(selectedProjectAtom);
      // @ts-ignore
      return selectedProject.states.items;
    },
    set: ({ set, get }, newStatesValue) => {
      // @ts-ignore
      let selectedProject = get(selectedProjectAtom);
      let newSelectedProjectValue = {
        ...selectedProject,
        states: [...newStatesValue],
      };
  
      set(selectedProjectAtom, newSelectedProjectValue);
    },
  });