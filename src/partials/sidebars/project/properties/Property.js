import { PropertyIcons } from "./PropertyIcons";
import { useDrop } from "react-dnd";
import { useState, useEffect } from "react";

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
  const [bg, setBg] = useState("");
  useEffect(() => {
    // const handleBg = () => {
    //   if (lastDroppedItem) {
    //     if (lastDroppedItem.dataType === "number") {
    //       setBg("bg-green-400 text-black");
    //     } else {
    //       setBg("bg-lightBlue-300 text-black");
    //     }
    //   } else {
    //     setBg("bg-gray-700 text-gray-500");
    //   }
    // };
    setBg("bg-lightBlue-300 text-black");
    // handleBg();
  }, [lastDroppedItem]);
  // const handleBg = (key) => {
  //   switch (key) {
  //     case string:

  //       break;

  //     default:
  //       break;
  //   }
  // }
  return (
    <li
      ref={drop}
      className="py-2 pl-2 last:mb-0 flex items-center border-b border-gray-500"
    >
      <PropertyIcons property={axis} />
      {isActive ? (
        <div className="block text-gray-400 hover:text-gray-200 transition duration-150 truncate">
          <span className="text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
            release to drop
          </span>
        </div>
      ) : (
        <div
          formatType={lastDroppedItem ? lastDroppedItem.dataType : ""}
          className={`flex justify-center h-4 ml-4 hover:text-gray-400 transition duration-150 truncate cursor-pointer rounded-2xl`}
        >
          <span className="text-xs font-medium mx-6 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
            {lastDroppedItem ? `${lastDroppedItem.key}` : `${axis}-Axis`}
          </span>
        </div>
      )}
      {/* 
      {lastDroppedItem && (
        <p>Last dropped: {JSON.stringify(lastDroppedItem)}</p>
      )} */}
    </li>
  );
};
