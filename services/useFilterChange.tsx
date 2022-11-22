import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { filterQuerySelector } from "../state";

/**
 * Applies a filter change by building SQL qeury and passing to Qt
 * @returns {void}
 */

export const useFilterChange = () => {
  const filterQuery = useRecoilValue(filterQuerySelector);
  useEffect(() => {
    // @ts-ignore
    if (filterQuery) {
      try { //attempt to use Update Filter
        // @ts-ignore
        window.core.UpdateFilter(JSON.stringify(filterQuery));
      } catch (error) {
        console.log({error})
      }
      
    }
  }, [filterQuery]);
};
