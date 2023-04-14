import { useDrag, useDrop } from 'react-dnd';
import { useRecoilValue } from 'recoil';
import { web as webTypes } from '@glyphx/types';

import { SortableHeaderCell } from './SortableHeaderCell';

import { useCombinedRefs } from 'services/useCombinedRefs';
import { droppedPropertiesSelector } from 'state/project';

import ColXIcon from 'public/svg/col-x-icon.svg';
import ColYIcon from 'public/svg/col-y-icon.svg';
import ColZIcon from 'public/svg/col-z-icon.svg';

export function DraggableHeaderRenderer({ onColumnsReorder, column, sortDirection, onSort, priority, isCellSelected }) {
  const droppedProps = useRecoilValue(droppedPropertiesSelector);

  const [{ isDragging }, drag] = useDrag({
    item: { type: 'COLUMN_DRAG', ...column },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'COLUMN_DRAG',
    // @ts-ignore
    drop({ key }) {
      onColumnsReorder(key, column.key);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const evalMatch = (key: string) => {
    const match = droppedProps.find((prop) => prop.key === key);
    if (match) return match.axis;
    return '';
  };

  function renderColumnTitle(column: webTypes.GridColumn) {
    switch (evalMatch(column.key)) {
      case 'X':
        return (
          <span className="inline-flex align-middle space-x-1">
            <p className="text-white font-sans font-medium text-[12px] text-center tracking-[.01em] leading-[14px] uppercase">
              {column.key}
            </p>
            <ColXIcon />
          </span>
        );

      case 'Y':
        return (
          <span className="inline-flex align-middle space-x-1">
            <p className="text-white font-sans font-medium text-[12px] text-center tracking-[.01em] leading-[14px] uppercase">
              {column.key}
            </p>
            <ColYIcon />
          </span>
        );

      case 'Z':
        return (
          <span className="inline-flex align-middle space-x-1">
            <p className="text-white font-sans font-medium text-[12px] text-center tracking-[.01em] leading-[14px] uppercase">
              {column.key}
            </p>
            <ColZIcon />
          </span>
        );

      default:
        return (
          <p className="inline-flex align-middle text-white font-sans font-medium text-[12px] text-center tracking-[.01em] leading-[14px] uppercase">
            {column.key}
          </p>
        );
    }
  }

  return (
    <div
      data-type={`${column.dataType}`}
      ref={useCombinedRefs(drag, drop)}
      className={`${isDragging ? 'opacity-80' : 'opacity-100'} flex items-center justify-center h-[30px] my-1  ${
        isOver ? 'bg-blue-500' : ''
      }`}
    >
      <SortableHeaderCell
        sortDirection={sortDirection}
        onSort={onSort}
        priority={priority}
        isCellSelected={isCellSelected}
      >
        {renderColumnTitle(column)}
      </SortableHeaderCell>
    </div>
  );
}
