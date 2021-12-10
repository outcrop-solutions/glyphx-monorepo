import { PropertyIcons } from "./PropertyIcons";
import { useDrop } from "react-dnd";

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
    <li className="mb-1 last:mb-0 flex">
      <PropertyIcons property={axis} />
      {/* <div className="block text-gray-400 hover:text-gray-200 transition duration-150 truncate">
        <span className="text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
          {item || ""}
        </span>
      </div> */}
      <div ref={drop} className="bg-white">
        {isActive ? "release to drop" : "this accepts columns"}
        {lastDroppedItem && (
          <p>Last dropped: {JSON.stringify(lastDroppedItem)}</p>
        )}
      </div>
    </li>
  );
};
