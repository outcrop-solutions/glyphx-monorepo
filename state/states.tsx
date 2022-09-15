import { atom, selector } from "recoil";
import { selectedProjectSelector } from "./project";

// holds state of currently selected state
export const selectedStateAtom = atom({
  key: "selectedState",
  default: {},
  // add atom effect to handle state change via we
});

// holds the ID of the currently selected state
export const activeStateAtom = atom({
  key: "activeState",
  default: "",
});

export const stateQueryAtom = atom({
  key: "stateQuery",
  default: "",
  // TODO: use atom effect to pass query to Qt
});


export const statesSelector = selector({
  key: "states",
  get: ({ get }) => {
    let selectedProject = get(selectedProjectSelector);
    if (!selectedProject) return;
    // @ts-ignore
    return selectedProject.states.items;
  },
  set: ({ set, get }, newStatesValue) => {
    // @ts-ignore
    let selectedProject = get(selectedProjectSelector);
    if (!selectedProject) return;
    let newSelectedProjectValue = {
      ...selectedProject,
      states: [...newStatesValue],
    };

    set(selectedProjectSelector, newSelectedProjectValue);
  },
});
