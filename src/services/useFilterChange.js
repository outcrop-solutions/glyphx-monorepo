import { useEffect } from "react";

export const useFilterChange = (filtersApplied) => {
  //build query and call filter change function
  useEffect(() => {
    if (filtersApplied.length > 0 && window && window.core) {
      // if (filtersApplied && filtersApplied.length > 0) {
      let filterStringArr = [];

      for (let i = 0; i < filtersApplied.length; i++) {
        let filter = filtersApplied[i];
        // let cols = filter.columns
        // for (let j = 0; j < cols.length; j++) {
        let name = filter.name;
        let min = filter.min;
        let max = filter.max;

        let queryStr = `${name || "-"} BETWEEN ${min || "-"} AND ${max || "-"}`;
        filterStringArr.push(queryStr);
        // }
      }
      let query =
        filterStringArr.length > 0
          ? `SELECT * from 0bc27e1c-b48b-474e-844d-4ec1b0f94613 WHERE ${filterStringArr.join(
              "AND"
            )}`
          : "";

      const updateFilterInput = {
        filter: query,
      };
      console.log({ updateFilterInput });
      window.core.UpdateFilter(JSON.stringify(updateFilterInput));
    }
    console.log({ filtersApplied });
  }, [filtersApplied]);
  return { isFilterChanged: true };
};
