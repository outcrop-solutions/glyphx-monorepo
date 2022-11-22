import { atom, selector } from "recoil";
import { payloadSelector, selectedProjectSelector } from "./project";
import { droppedPropertiesSelector } from "./properties";

export const filtersSelector = selector({
  key: "filters",
  get: ({ get }) => {
    let selectedProject = get(selectedProjectSelector);
    // @ts-ignore
    return selectedProject.filters.items;
  },
  set: ({ set, get }, newFiltersValue) => {
    // @ts-ignore
    let selectedProject = get(selectedProjectSelector);
    let newSelectedProjectValue = {
      ...selectedProject,
      // @ts-ignore
      filters: [...newFiltersValue],
    };
    // @ts-ignore
    set(selectedProjectSelector, newSelectedProjectValue);
  },
});

/**
 * HOLDS FILTERS TO BE APPLIED TO THE GLYPH
 * 
 * FOR INTEGERS:
 * 
 * ```
 * [
 *  ...,
 *  {
 *    name: (Name of Column)
 *    min: (Min Value)
 *    max: (Max Value)
 *  },
 *  ...
 * ]
 * ```
 * 
 * FOR STRING:
 * 
 * ```
 * [
 *  ...,
 *  {
 *    name: (Name of Column),
 *    keywords: [Array of Keywords]
 *  },
 *  ...
 * ]
 * ```
 */
export const filtersAppliedAtom = atom({
  key: "filtersApplied",
  default: [],
});

export const isFilterSafeAtom = selector({
  key: "isFilterSafe",
  get: ({ get }) => {
    const droppedProps = get(droppedPropertiesSelector);
    const filtersApplied = get(filtersAppliedAtom);
    return filtersApplied.length > 0 && droppedProps.length >= 3;
  },
});


/**
 * TAKES FILTERS THAT ARE APPLIED
  TAKES WHETHER OR NOT FILTER IS SAFE
  ... 
  CREATES SQL QUERY
  TAKE RESULT AND PASS TO QT
 */
export const filterQuerySelector = selector({
  key: "filterQuery",
  get: ({ get }) => {
    const filtersApplied = get(filtersAppliedAtom);
    const isFilterSafe = get(isFilterSafeAtom);
    const droppedProps = get(droppedPropertiesSelector);
    const { sdt } = get(payloadSelector);
    let selectedProject = get(selectedProjectSelector);

    if (filtersApplied.length === 0) { // stop from running query when nothing in there
      return undefined
    }

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
        // TODO: MAKE IT DYNAMIC PROJECT ID
          ? `SELECT rowid from \`${selectedProject.id}\` WHERE ${filterStringArr.join(
              " AND "
            )}`
          : "";

      const updateFilterInput = {
        filter: query,
      };
      return updateFilterInput;
    } else if (sdt && filtersApplied.length === 0 && droppedProps.length >= 3) {
      // TODO: MAKE IT DYNAMIC PROJECT ID
      let query = `SELECT rowid from \`${selectedProject.id}\``;
      const updateFilterInput = {
        filter: query,
      };
      return updateFilterInput;
    } else {
      return undefined;
    }
  },
});
