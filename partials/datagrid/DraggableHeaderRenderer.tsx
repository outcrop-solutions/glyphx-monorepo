import { useDrag, useDrop } from "react-dnd";

import { useEffect, useState } from "react";

import { SortableHeaderCell } from "./SortableHeaderCell";

import { useCombinedRefs } from "services/useCombinedRefs";

import { droppedPropertiesSelector, propertiesAtom } from "@/state/properties";
import { useRecoilValue } from "recoil";

export function DraggableHeaderRenderer({
  onColumnsReorder,
  column,
  sortDirection,
  onSort,
  priority,
  isCellSelected,
  isDropped,
}) {

  const droppedProps = useRecoilValue(droppedPropertiesSelector);
  const [assignedAxis, setAxis] = useState(null);
  const properties = useRecoilValue(propertiesAtom);

  // @ts-ignore
  const [{ isDragging }, drag] = useDrag({
    // @ts-ignore
    type: "COLUMN_DRAG",
    item: { key: column.key, type: "COLUMN_DRAG", dataType: column.dataType, index: column.idx - 1 },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: "COLUMN_DRAG",
    // @ts-ignore
    drop({ key }) {
      onColumnsReorder(key, column.key);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  /**
   * Checks if column has been dropped using droppedPropsSelector
   */
  function isColumnDropped() {
    if (droppedProps?.length > 0) {
      for (let index = 0; index < droppedProps.length; index++) {
        if (droppedProps[index].lastDroppedItem.key === column.key) {
          // console.log("setting axis to", droppedProps[index].axis)
          setAxis(droppedProps[index].axis);
        }
      }

    }
  }

  /**
   * Renders column name with title
   * @returns 
   */
  function renderColumnTitle() {
    switch (assignedAxis) {
      case 'X':
        return <span className="  inline-flex align-middle space-x-1">
          {/*  className="text-white font-sans font-medium text-[12px] text-center tracking-[.01em] leading-[14px] uppercase" */}
          <p>{column.name}</p>
          <svg className="align-top group-hover:hidden" width="16" height="16" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M8.99978 10.75C8.58557 10.75 8.24978 10.4142 8.24978 10V4.5C8.24978 4.08579 8.58557 3.75 8.99978 3.75C9.41399 3.75 9.74978 4.08579 9.74978 4.5V10C9.74978 10.4142 9.41399 10.75 8.99978 10.75Z" fill="white" />
            <path fillRule="evenodd" clipRule="evenodd" d="M3.8413 13.371C3.6157 13.0236 3.71443 12.5591 4.06182 12.3335L8.67451 9.338C9.0219 9.1124 9.4864 9.21113 9.71199 9.55852C9.93759 9.90591 9.83886 10.3704 9.49147 10.596L4.87878 13.5915C4.53139 13.8171 4.0669 13.7184 3.8413 13.371Z" fill="white" />
            <path fillRule="evenodd" clipRule="evenodd" d="M14.3413 13.379C14.1157 13.7264 13.6512 13.8251 13.3038 13.5995L8.69113 10.604C8.34374 10.3784 8.24501 9.91392 8.47061 9.56653C8.6962 9.21914 9.1607 9.12041 9.50809 9.34601L14.1208 12.3415C14.4682 12.5671 14.5669 13.0316 14.3413 13.379Z" fill="white" />
            <path d="M2.92 8.072C2.76 8.072 2.62667 8.02933 2.52 7.944C2.41867 7.85333 2.36 7.744 2.344 7.616C2.328 7.48267 2.37067 7.34667 2.472 7.208L4.24 4.864V5.416L2.544 3.16C2.44267 3.016 2.39733 2.88 2.408 2.752C2.424 2.61867 2.48267 2.50933 2.584 2.424C2.69067 2.33333 2.82133 2.288 2.976 2.288C3.10933 2.288 3.224 2.32 3.32 2.384C3.42133 2.448 3.52267 2.54933 3.624 2.688L4.944 4.512H4.544L5.856 2.688C5.95733 2.544 6.05867 2.44267 6.16 2.384C6.26133 2.32 6.37867 2.288 6.512 2.288C6.672 2.288 6.80267 2.33067 6.904 2.416C7.01067 2.50133 7.06933 2.61067 7.08 2.744C7.096 2.872 7.05067 3.01067 6.944 3.16L5.24 5.416V4.864L7 7.208C7.10667 7.34667 7.152 7.48267 7.136 7.616C7.12533 7.744 7.06667 7.85333 6.96 7.944C6.85867 8.02933 6.72533 8.072 6.56 8.072C6.432 8.072 6.31733 8.04 6.216 7.976C6.12 7.912 6.01867 7.808 5.912 7.664L4.536 5.768H4.944L3.568 7.664C3.46667 7.808 3.36533 7.912 3.264 7.976C3.16267 8.04 3.048 8.072 2.92 8.072Z" fill="white" />
          </svg> 
        </span>

      case 'Y':
        return <span className="inline-flex align-middle space-x-1">
          {/* className="text-white font-sans font-medium text-[12px] text-center tracking-[.01em] leading-[14px] uppercase" */}
          <p>{column.name}</p>
          <svg className="align-top group-hover:hidden" width="16" height="16" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M8.99978 10.75C8.58557 10.75 8.24978 10.4142 8.24978 10V4.5C8.24978 4.08579 8.58557 3.75 8.99978 3.75C9.41399 3.75 9.74978 4.08579 9.74978 4.5V10C9.74978 10.4142 9.41399 10.75 8.99978 10.75Z" fill="white" />
            <path fillRule="evenodd" clipRule="evenodd" d="M3.8413 13.371C3.6157 13.0236 3.71443 12.5591 4.06182 12.3335L8.67451 9.338C9.0219 9.1124 9.4864 9.21113 9.71199 9.55852C9.93759 9.90591 9.83886 10.3704 9.49147 10.596L4.87878 13.5915C4.53139 13.8171 4.0669 13.7184 3.8413 13.371Z" fill="white" />
            <path fillRule="evenodd" clipRule="evenodd" d="M14.3413 13.379C14.1157 13.7264 13.6512 13.8251 13.3038 13.5995L8.69113 10.604C8.34374 10.3784 8.24501 9.91392 8.47061 9.56653C8.6962 9.21914 9.1607 9.12041 9.50809 9.34601L14.1208 12.3415C14.4682 12.5671 14.5669 13.0316 14.3413 13.379Z" fill="white" />
            <path d="M4.528 8.072C4.32533 8.072 4.17067 8.016 4.064 7.904C3.95733 7.792 3.904 7.632 3.904 7.424V5.104L4.16 5.816L2.272 3.136C2.19733 3.024 2.16533 2.904 2.176 2.776C2.18667 2.64267 2.24 2.528 2.336 2.432C2.432 2.336 2.568 2.288 2.744 2.288C2.872 2.288 2.98667 2.32 3.088 2.384C3.19467 2.448 3.296 2.54933 3.392 2.688L4.672 4.536H4.416L5.696 2.688C5.79733 2.544 5.896 2.44267 5.992 2.384C6.09333 2.32 6.21067 2.288 6.344 2.288C6.51467 2.288 6.648 2.33333 6.744 2.424C6.84 2.50933 6.89067 2.61867 6.896 2.752C6.90133 2.88 6.856 3.01333 6.76 3.152L4.896 5.816L5.144 5.104V7.424C5.144 7.856 4.93867 8.072 4.528 8.072Z" fill="white" />
          </svg>
        </span>

      case 'Z':
        return <span className="inline-flex align-middle space-x-1">
          {/* className="text-white font-sans font-medium text-[12px] text-center tracking-[.01em] leading-[14px] uppercase" */}
          <p>{column.name}</p>
          <svg className="align-top group-hover:hidden" width="16" height="16" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M8.99978 10.75C8.58557 10.75 8.24978 10.4142 8.24978 10V4.5C8.24978 4.08579 8.58557 3.75 8.99978 3.75C9.41399 3.75 9.74978 4.08579 9.74978 4.5V10C9.74978 10.4142 9.41399 10.75 8.99978 10.75Z" fill="white" />
            <path fillRule="evenodd" clipRule="evenodd" d="M3.8413 13.371C3.6157 13.0236 3.71443 12.5591 4.06182 12.3335L8.67451 9.338C9.0219 9.1124 9.4864 9.21113 9.71199 9.55852C9.93759 9.90591 9.83886 10.3704 9.49147 10.596L4.87878 13.5915C4.53139 13.8171 4.0669 13.7184 3.8413 13.371Z" fill="white" />
            <path fillRule="evenodd" clipRule="evenodd" d="M14.3413 13.379C14.1157 13.7264 13.6512 13.8251 13.3038 13.5995L8.69113 10.604C8.34374 10.3784 8.24501 9.91392 8.47061 9.56653C8.6962 9.21914 9.1607 9.12041 9.50809 9.34601L14.1208 12.3415C14.4682 12.5671 14.5669 13.0316 14.3413 13.379Z" fill="white" />
            <path d="M2.936 8C2.776 8 2.64533 7.968 2.544 7.904C2.44267 7.83467 2.37333 7.744 2.336 7.632C2.304 7.51467 2.304 7.38667 2.336 7.248C2.37333 7.10933 2.448 6.97067 2.56 6.832L5.472 3.016V3.392H2.84C2.664 3.392 2.528 3.34667 2.432 3.256C2.34133 3.16533 2.296 3.03733 2.296 2.872C2.296 2.70667 2.34133 2.58133 2.432 2.496C2.528 2.40533 2.664 2.36 2.84 2.36H6.056C6.22133 2.36 6.352 2.39467 6.448 2.464C6.54933 2.528 6.61867 2.616 6.656 2.728C6.69333 2.84 6.69333 2.968 6.656 3.112C6.61867 3.25067 6.544 3.38933 6.432 3.528L3.52 7.336V6.968H6.28C6.456 6.968 6.58933 7.01333 6.68 7.104C6.776 7.18933 6.824 7.31467 6.824 7.48C6.824 7.65067 6.776 7.78133 6.68 7.872C6.58933 7.95733 6.456 8 6.28 8H2.936Z" fill="white" />
          </svg>
        </span>

      default:
        return <></>
    }
  }

  useEffect(() => {
    isColumnDropped();
  }, [droppedProps])


  return (
    <div
      datatype={`${column.dataType}`}
      ref={useCombinedRefs(drag, drop)}
      className={`${isDragging ? "opacity-80" : "opacity-100"} px-2 h-full group`}
    >
      <SortableHeaderCell
        sortDirection={sortDirection}
        onSort={onSort}
        priority={priority}
        isCellSelected={isCellSelected}
      >
        {assignedAxis ? renderColumnTitle() : <p>{column.name}</p>} 
        {/* className="inline-flex align-middle text-white font-sans font-medium text-[12px] text-center tracking-[.01em] leading-[14px] uppercase" */}
      </SortableHeaderCell>
    </div>
  );
}


