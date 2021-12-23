import { useEffect } from "react";

export const useFilterChange = (filtersApplied) => {
  //build query and call filter change function
  useEffect(() => {
    if (window && window.core) {
      if (filtersApplied.length > 0) {
        // if (filtersApplied && filtersApplied.length > 0) {
        let filterStringArr = [];

        for (let i = 0; i < filtersApplied.length; i++) {
          let filter = filtersApplied[i];
          // let cols = filter.columns
          // for (let j = 0; j < cols.length; j++) {
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
        console.log({ updateFilterInput });
        window.core.UpdateFilter(JSON.stringify(updateFilterInput));
      } else {
        window.core.UpdateFilter(
          JSON.stringify({
            filter: `SELECT rowid from \`0bc27e1c-b48b-474e-844d-4ec1b0f94613\``,
          })
        );
      }
    }
    console.log({ filtersApplied });
  }, [filtersApplied]);
  return { isFilterChanged: true };
};
