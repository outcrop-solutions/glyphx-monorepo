import {useCallback} from 'react';

/**
 * handles combined refs for DraggableHeaderRenderer in DataGrid
 * @param {Array} refs
 * @returns {Promise}
 */
export function useCombinedRefs(...refs) {
  return useCallback(
    (handle) => {
      for (const ref of refs) {
        if (typeof ref === 'function') {
          ref(handle);
        } else if (ref !== null && 'current' in ref) {
          // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31065
          ref.current = handle;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );
}
