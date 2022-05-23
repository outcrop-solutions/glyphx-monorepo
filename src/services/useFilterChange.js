import { useEffect } from "react";

/**
 * Applies a filter change by building SQL qeury and passing to Qt
 * @param {Array} filtersApplied
 * @param {string} sdt
 * @param {Array} propertiesArr
 * @param {function} setQuery
 * @returns {Object}
 */

export const useFilterChange = (
  filtersApplied,
  projectId,
  sdt,
  propertiesArr,
  setQuery
) => {
  useEffect(() => {
    if (window && window.core) {
      let propsArr = [];
      if (propertiesArr && propertiesArr.length > 0) {
        propsArr = propertiesArr.filter((item) => item.lastDroppedItem);
      }
      if (filtersApplied.length > 0 && propsArr.length >= 3) {
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
        setQuery(query);

        window.core.UpdateFilter(JSON.stringify(updateFilterInput));
      } else if (sdt && filtersApplied.length === 0 && propsArr.length >= 3) {
        let query = `SELECT rowid from \`0bc27e1c-b48b-474e-844d-4ec1b0f94613\``;
        const updateFilterInput = {
          filter: query,
        };
        setQuery([query]);

        window.core.UpdateFilter(JSON.stringify(updateFilterInput));
      }
    }
  }, [filtersApplied]);
  return { isFilterChanged: true };
};
