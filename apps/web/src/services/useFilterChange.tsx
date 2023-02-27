import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { filterQuerySelector } from '../state';

/**
 * Applies a filter change by building SQL qeury and passing to Qt
 * @returns {void}
 */

export const useFilterChange = () => {
  const filterQuery = useRecoilValue(filterQuerySelector);

  useEffect(() => {
    if (filterQuery) {
      try {
        //attempt to use Update Filter
        window.core.UpdateFilter(JSON.stringify(filterQuery));
      } catch (error) {}
    }
  }, [filterQuery]);
};
