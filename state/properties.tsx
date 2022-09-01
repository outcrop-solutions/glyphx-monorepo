import { atom, selector } from "recoil";
import { selectedProjectAtom } from "./project";

export const propertiesSelector = selector({
    key: "properties",
    get: ({ get }) => {
      let selectedProject = get(selectedProjectAtom);
      // @ts-ignore
      return selectedProject.properties;
    },
    set: ({ set, get }, newPropertiesValue) => {
      // @ts-ignore
      let selectedProject = get(selectedProjectAtom);
      let newSelectedProjectValue = {
        ...selectedProject,
        properties: [...newPropertiesValue],
      };
  
      set(selectedProjectAtom, newSelectedProjectValue);
    },
  });
  