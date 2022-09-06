import { atom, selector } from "recoil";
import { payloadSelector, selectedProjectAtom } from "./project";
import { droppedPropertiesSelector, propertiesSelector } from "./properties";

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

export const filtersAppliedAtom = atom({
  key: "filtersApplied",
  default: [],
});

export const isFilterSafeAtom = selector({
  key: "isFilterSafe",
  get: ({ get }) => {
    const droppedProps = get(droppedPropertiesSelector);
    const filtersApplied = get(fitlersAppliedAtom);
    return filtersApplied.length > 0 && droppedProps.length >= 3;
  },
});

export const filterQueryAtom = selector({
  key: "filterQuery",
  get: ({ get }) => {
    const filtersApplied = get(fitlersAppliedAtom);
    const isFilterSafe = get(isFilterSafeAtom);
    const droppedProps = get(droppedPropertiesSelector);
    const { sdt } = get(payloadSelector);

    if (isFilterSafe) {
      let filterStringArr = [];

      for (let i = 0; i < filtersApplied.length; i++) {
        let filter = filtersApplied[i];

        if (filter.keywords && filter.keywords.length > 0) {
          let name = filter.name;
          let keywords = filter.keywords;
          let queryStr = `MATCH \`${name || "-"}\` AGAINST (${
            keywords.join(" ") || "-"
          })`;
          filterStringArr.push(queryStr);
        } else {
          let name = filter.name;
          let min = filter.min;
          let max = filter.max;

          let queryStr = `\`${name || "-"}\` BETWEEN ${min || "-"} AND ${
            max || "-"
          }`;
          filterStringArr.push(queryStr);
          // }
        }
      }
      let query =
        filterStringArr.length > 0
          ? `SELECT rowid from \`0bc27e1c-b48b-474e-844d-4ec1b0f94613\` WHERE ${filterStringArr.join(
              " AND "
            )}`
          : "";

      const updateFilterInput = {
        filter: query,
      };
      return updateFilterInput;
    } else if (sdt && filtersApplied.length === 0 && droppedProps.length >= 3) {
      let query = `SELECT rowid from \`0bc27e1c-b48b-474e-844d-4ec1b0f94613\``;
      const updateFilterInput = {
        filter: query,
      };
      return updateFilterInput;
    } else {
      return undefined;
    }
  },
});
