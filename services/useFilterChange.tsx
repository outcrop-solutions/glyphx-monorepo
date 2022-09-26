import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { filterQueryAtom } from "../state";

/**
 * Applies a filter change by building SQL qeury and passing to Qt
 * @returns {void}
 */

export const useFilterChange = () => {
  const filterQuery = useRecoilValue(filterQueryAtom);
  useEffect(() => {
    // @ts-ignore
    if (filterQuery && window && window.core) {
      // @ts-ignore
      window.core.UpdateFilter(JSON.stringify(filterQuery));
    }
  }, [filterQuery]);
};
