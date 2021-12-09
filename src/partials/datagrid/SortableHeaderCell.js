import { useFocusRef } from "../../services/useFocusRef";

export default function SortableHeaderCell({
  onSort,
  sortDirection,
  priority,
  children,
  isCellSelected,
}) {
  const { ref, tabIndex } = useFocusRef(isCellSelected);

  function handleKeyDown(event) {
    if (event.key === " " || event.key === "Enter") {
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
      className='cursor-pointer flex focus:outline-none'
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span className='flex-grow overflow-hidden overflow-ellipsis'>{children}</span>
      <span>
        {sortDirection !== undefined && (
          <svg
            viewBox="0 0 12 8"
            width="12"
            height="8"
            className='fill-current'
            aria-hidden
          >
            <path
              d={sortDirection === "ASC" ? "M0 8 6 0 12 8" : "M0 0 6 8 12 0"}
            />
          </svg>
        )}
        {priority}
      </span>
    </span>
  );
}
