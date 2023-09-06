import {useRef, useLayoutEffect} from 'react';

/**
 * handles focus ref for SortableHeaderCell in DraggableHeaderRenderer
 * @param {boolean} isSelected
 * @returns {Object}
 */

export function useFocusRef(isSelected) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!isSelected) return;
    // @ts-ignore
    ref.current?.focus({preventScroll: true});
  }, [isSelected]);

  return {
    ref,
    tabIndex: isSelected ? 0 : -1,
  };
}
