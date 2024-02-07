'use client';
import {useFocusRef} from 'services/useFocusRef';
export function SortableHeaderCell({onSort, children, isCellSelected}) {
  const {ref, tabIndex} = useFocusRef(isCellSelected);

  function handleKeyDown(event) {
    if (event.key === ' ' || event.key === 'Enter') {
      // stop propagation to prevent scrolling
      event.preventDefault();
      onSort(event.ctrlKey || event.metaKey);
    }
  }

  function handleClick(event) {
    onSort(event.ctrlKey || event.metaKey);
  }

  return (
    <span
      ref={ref}
      tabIndex={tabIndex}
      className="cursor-pointer flex focus:outline-none"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div
        // datatype={handleType()}
        className="grow overflow-hidden text-ellipsis"
      >
        {children}
      </div>
    </span>
  );
}
