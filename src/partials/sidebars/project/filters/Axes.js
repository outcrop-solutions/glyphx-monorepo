import { AxesIcons } from "./AxesIcons";
import { useState } from "react";
import { Filter } from "./Filter";
export const Axes = ({ axis, lastDroppedItem }) => {
  const [isRange, setIsRange] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  return (
    <li className="py-2 pl-2 last:mb-0 flex items-center border-b border-gray-500">
      <AxesIcons property={axis} />
      <Filter
        isSearch={isSearch}
        isRange={isRange}
        setIsRange={setIsRange}
        setIsSearch={setIsSearch}
      />

      <div
        className={`flex justify-center ${
          lastDroppedItem
            ? "bg-blue-600 text-white"
            : "bg-gray-700 text-gray-500"
        } h-4 ml-4 hover:text-gray-400 transition duration-150 truncate cursor-pointer rounded-2xl`}
      >
        <span className="text-xs font-medium mx-6 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
          {lastDroppedItem ? `${lastDroppedItem.key}` : `${axis}-Axis`}
        </span>
      </div>
    </li>
  );
};
