import { useDrop } from "react-dnd";
import { AxesIcons } from "./AxesIcons";


export const Property = ({ axis, accept, lastDroppedItem, onDrop }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept,
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  const isActive = isOver && canDrop;

  return (
    <li
      ref={drop}
      className="py-2 pl-2 group last:mb-0 flex items-center"
    >
      <AxesIcons property={axis} />
      {isActive ? (
        <div className="block text-gray-400 hover:text-gray-200 transition duration-150 truncate">
          <span className="text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
            release to drop
          </span>
        </div>
      ) : (
        <div
          formattype={lastDroppedItem ? lastDroppedItem.dataType : ""}
          className={`flex justify-center h-4 ml-4 bg-gray-800 group-hover:text-gray-400 transition duration-150 truncate cursor-pointer rounded-2xl`}
        >
          <span className="text-xs font-medium mx-6 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
            {lastDroppedItem ? `${lastDroppedItem.key}` : `${axis}-Axis`}
          </span>
        </div>
      )}
    </li>
  );
};
